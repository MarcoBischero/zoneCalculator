import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { generateRecipeContent } from '@/lib/recipe-generator';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userId = session.user.id;
        let user: any;

        if (userId) {
            user = await prisma.user.findUnique({
                where: { id: parseInt(userId) },
                select: { id: true, dieticianId: true }
            });
        } else {
            user = await prisma.user.findFirst({
                where: { email: session.user.email },
                select: { id: true, dieticianId: true }
            });
        }

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Pagination parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Logic: Fetch MY meals OR (My Dietician's meals where isShared=true)
        const whereClause: any = {
            OR: [
                { codUser: user.id },
            ]
        };

        if (user.dieticianId) {
            whereClause.OR.push({
                codUser: user.dieticianId,
                isShared: true
            });
        }

        // Get total count for pagination metadata
        const total = await prisma.pasto.count({ where: whereClause });

        const meals = await prisma.pasto.findMany({
            where: whereClause,
            include: {
                alimenti: {
                    include: {
                        alimento: true
                    }
                },
                user: { select: { username: true } } // Include author name
            },
            orderBy: {
                codicePasto: 'desc'
            },
            skip,
            take: limit
        });

        return NextResponse.json({
            meals,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasMore: skip + meals.length < total
            }
        });
    } catch (error) {
        logger.error('Error fetching meals', error);
        return NextResponse.json({ error: 'Failed to fetch meals' }, { status: 500 });
    }
}


export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, name, mealType, blocks, rows } = body;

        // Fetch user
        const user = await prisma.user.findFirst({
            where: { email: session.user.email },
            select: { id: true, idRuolo: true }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        let mealId = id ? parseInt(id) : undefined;

        // To properly aggregate, we need the IDs first.
        const distinctNames = Array.from(new Set(rows.map((r: any) => r.foodName).filter(Boolean)));

        // OPTIMIZATION: Single query to fetch all foods at once
        const foods = await prisma.alimento.findMany({
            where: { nome: { in: distinctNames as string[] } },
            select: { codiceAlimento: true, nome: true }
        });

        // Build lookup maps for O(1) access
        const foodMap = new Map<string, number>();
        const codToName = new Map<number, string>();
        foods.forEach(f => {
            foodMap.set(f.nome, f.codiceAlimento);
            codToName.set(f.codiceAlimento, f.nome);
        });

        // Aggregate ingredients by food ID
        const ingredientsMap = new Map<number, number>();
        for (const row of rows) {
            if (!row.foodName) continue;
            const cod = foodMap.get(row.foodName);
            if (cod) {
                const current = ingredientsMap.get(cod) || 0;
                ingredientsMap.set(cod, current + parseFloat(row.grams));
            }
        }

        // Transaction
        const result = await prisma.$transaction(async (tx) => {
            let finalMealId = mealId;

            if (mealId) {
                // Verify ownership
                const existing = await tx.pasto.findUnique({ where: { codicePasto: mealId } });
                if (!existing) throw new Error('Meal not found');
                if (existing.codUser !== user.id) throw new Error('Unauthorized: Cannot edit shared meal');
                // Note: Patients cannot edit shared meals, only create their own copy or use as is. 
                // We assume 'existing.codUser !== user.id' covers preventing editing dietician's meal.

                await tx.pasto.update({
                    where: { codicePasto: mealId },
                    data: {
                        nome: name,
                        mealType: body.mealType || '0',
                        blocks: parseFloat(blocks),
                        // SECURITY: Only Dieticians (Role 2) can share meals
                        isShared: (user.idRuolo === 2) ? (body.isShared || false) : false
                    }
                });

                // Clear old ingredients
                await tx.pastoAlimento.deleteMany({
                    where: { codPasto: mealId }
                });
            } else {
                const newMeal = await tx.pasto.create({
                    data: {
                        codUser: user.id,
                        nome: name,
                        mealType: body.mealType || '0',
                        blocks: parseFloat(blocks),
                        // SECURITY: Only Dieticians (Role 2) can share meals
                        isShared: (user.idRuolo === 2) ? (body.isShared || false) : false
                    }
                });
                finalMealId = newMeal.codicePasto;
            }

            // Insert Aggregated Ingredients
            // Prisma createMany is supported in MySQL
            const dataToInsert = Array.from(ingredientsMap.entries()).map(([codAlimento, grams]) => ({
                codPasto: finalMealId!,
                codAlimento,
                grAlimento: grams
            }));

            if (dataToInsert.length > 0) {
                await tx.pastoAlimento.createMany({
                    data: dataToInsert
                });
            }

            return finalMealId;
        });

        const finalId = result;

        // Trigger AI Generation (Fire and Forget)
        if (finalId) {
            // Award Gamification Points (Fire and Forget)
            import('@/lib/gamification').then(({ awardPoints }) => {
                awardPoints(user.id, 'LOG_MEAL');
            });

            // Re-fetch or construct ingredients list string
            const ingredientsList = Array.from(ingredientsMap.entries())
                .map(([cod, grams]) => {
                    // Need name. Lookup from foodMap inverted or refetch?
                    // Optimization: We know names from input rows.
                    // Simple fallback: construct rough list for AI prompt
                    return `${grams}g (Ingredient ID ${cod})`;
                }).join(', ');

            // Better: We have distinctNames and foods from earlier.
            // Let's reconstruct properly for better AI quality.
            const codToName = new Map<number, string>();
            foods.forEach(f => codToName.set(f.codiceAlimento, f.nome));

            const niceIngredientsList = Array.from(ingredientsMap.entries())
                .map(([cod, grams]) => `${grams}g ${codToName.get(cod) || 'Food'}`)
                .join(', ');

            generateRecipeContent(finalId, name, niceIngredientsList, 'it')
                .catch(err => console.error("Background Gen Error:", err));
        }

        return NextResponse.json({ success: true, id: result });

    } catch (error: any) {
        logger.error('Error saving meal', error);
        const status = error.message === 'Unauthorized' ? 403 : error.message === 'Meal not found' ? 404 : 500;
        return NextResponse.json({ error: error.message || 'Failed to save meal' }, { status });
    }
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Meal ID required' }, { status: 400 });

    try {
        await prisma.pastoAlimento.deleteMany({
            where: { codPasto: parseInt(id) }
        });

        await prisma.pasto.delete({
            where: { codicePasto: parseInt(id) }
        });

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
