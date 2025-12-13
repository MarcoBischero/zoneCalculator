import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { generateRecipeContent } from '@/lib/recipe-generator';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userId = parseInt(session.user.id);
        const userRole = (session.user as any).role;
        const isAdmin = (userRole === 1);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, dieticianId: true }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Pagination parameters
        const { searchParams } = new URL(request.url);
        const mealIdParam = searchParams.get('id');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // --- PACKAGE LOGIC ---
        // Fetch assigned Meal Packages
        // We want to verify if we should fetch package meals.
        // Logic: Always fetch Own Meals + Package Meals.

        let packageMealIds: number[] = [];
        if (!isAdmin) {
            const userPackages = await prisma.userPackage.findMany({
                where: {
                    userId: userId,
                    package: { type: 'MEAL' }
                },
                include: { package: { include: { items: { select: { mealId: true } } } } }
            });

            // Collect Meal IDs from packages
            userPackages.forEach((up: any) => {
                up.package.items.forEach((item: any) => {
                    if (item.mealId) packageMealIds.push(item.mealId);
                });
            });
        }

        // --- QUERY CONSTRUCTION ---
        const whereClause: any = {};

        // 1. Precise ID Fetch
        if (mealIdParam) {
            whereClause.codicePasto = parseInt(mealIdParam);
            // Security: Even if precise ID, must be accessible (Own OR Package OR Shared)
            // But 'OR' logic below handles availability.
            // If we set codPasto here, we still need to verify access permissions via the OR groups.
            // So we should combine conditions.
        }

        // 2. Access Conditions
        const accessConditions: any[] = [
            { codUser: user.id } // My Meals
        ];

        // Add Package Meals
        if (packageMealIds.length > 0) {
            accessConditions.push({ codicePasto: { in: packageMealIds } });
        }

        // Legacy "Shared by Dietician" fallback (optional, if we want to support non-package sharing)
        if (user.dieticianId) {
            accessConditions.push({
                codUser: user.dieticianId,
                isShared: true
            });
        }

        // Combine Access Conditions
        whereClause.OR = accessConditions;

        // If we have a specific ID, we must intersect it with access conditions
        // Prisma doesn't support "Where ID=X AND (Cond A OR Cond B)" cleanly if Cond A/B are unrelated to ID in structure?
        // Actually it does: where: { codicePasto: X, OR: [...] }

        // Get total count
        const total = await prisma.pasto.count({ where: whereClause });

        const meals = await prisma.pasto.findMany({
            where: whereClause,
            include: {
                alimenti: {
                    include: {
                        alimento: true
                    }
                },
                user: { select: { username: true } }, // Include author name
                packageItems: {
                    include: { package: true }
                }
            },
            orderBy: {
                codicePasto: 'desc'
            },
            skip,
            take: limit
        });

        // Enrich meals with "packageName" if listed via package
        // The meal might be in multiple packages.
        // We can map this on the backend or frontend. 
        // Let's add a virtual field or just return the packageItems (already included).
        // Frontend will parse packageItems[0].package.name

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

        const { id, name, mealType, blocks } = body;
        // Use 'foods' from payload, but alias to 'rows' to match existing logic if needed,
        // or just use a new variable. Existing logic uses 'rows'.
        // Use 'foods' from payload, but alias to 'rows' to match existing logic if needed,
        // or just use a new variable. Existing logic uses 'rows'.
        const rawRows = body.foods || body.rows || []; // Support both for backward compatibility

        // Normalize rows to ensure foodName is present
        const rows = Array.isArray(rawRows) ? rawRows.map((r: any) => ({
            ...r,
            foodName: r.foodName || r.nome // Fix for frontend sending 'nome'
        })) : [];

        if (!Array.isArray(rows)) {
            return NextResponse.json({ error: 'Validation Error: Invalid foods data' }, { status: 400 });
        }

        const userId = parseInt(session.user.id);

        // Security: Rate Limit (10 requests per minute)
        const limitCheck = rateLimit(`meal-create-${userId}`, 10, 60000);
        if (!limitCheck.success) return limitCheck.error;

        // Security: Input Validation
        if (!name || name.length > 100) {
            return NextResponse.json({ error: 'Validation Error: Name is too long or empty' }, { status: 400 });
        }
        if (parseFloat(blocks) < 0) {
            return NextResponse.json({ error: 'Validation Error: Blocks cannot be negative' }, { status: 400 });
        }

        // Fetch user
        const user = await prisma.user.findFirst({
            where: { email: session.user.email },
            select: { id: true, idRuolo: true }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        let mealId = id ? parseInt(id) : undefined;

        // To properly aggregate, we need the IDs first.
        const distinctNames = Array.from(new Set(rows.map((r: any) => r.foodName).filter((n: any) => n && typeof n === 'string' && n.trim().length > 0)));

        // OPTIMIZATION: Single query to fetch all foods at once
        const foods = await prisma.alimento.findMany({
            where: { nome: { in: distinctNames as string[] } },
            select: { codiceAlimento: true, nome: true }
        });

        const foundNames = new Set(foods.map(f => f.nome));
        const missingNames = distinctNames.filter(name => !foundNames.has(name as string));

        // Auto-create missing foods
        if (missingNames.length > 0) {
            console.log(`Auto-creating ${missingNames.length} missing foods:`, missingNames);

            for (const missingName of missingNames) {
                // Find the source row to get macros
                const sourceRow = rows.find((r: any) => r.foodName === missingName);
                if (sourceRow) {
                    try {
                        const newFood = await prisma.alimento.create({
                            data: {
                                nome: missingName as string,
                                proteine: parseFloat(sourceRow.protein) || 0,
                                carboidrati: parseFloat(sourceRow.carbs) || 0,
                                grassi: parseFloat(sourceRow.fat) || 0,
                                codTipo: 1, // Default to "Proteine" or generic
                                codFonte: 1
                            }
                        });
                        // Add to our local list so the rest of the logic works
                        foods.push({ codiceAlimento: newFood.codiceAlimento, nome: newFood.nome });
                    } catch (err) {
                        console.error(`Failed to auto-create food ${missingName}:`, err);
                        // Continue, but this ingredient will be skipped in mapping
                    }
                }
            }
        }

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

            // Security: Validate grams
            const grams = parseFloat(row.grams);
            if (isNaN(grams) || grams < 0) {
                return NextResponse.json({ error: 'Validation Error: Ingredient grams cannot be negative' }, { status: 400 });
            }

            const cod = foodMap.get(row.foodName);
            if (cod) {
                const current = ingredientsMap.get(cod) || 0;
                ingredientsMap.set(cod, current + grams);
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
        const mealId = parseInt(id);
        const userId = parseInt(session.user.id);
        const userRole = Number((session.user as any).role);

        // Security Check: Verify Ownership
        const meal = await prisma.pasto.findUnique({
            where: { codicePasto: mealId },
            select: { codUser: true }
        });

        if (!meal) {
            return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
        }

        // Allow delete if Owner OR Super Admin (Role 1)
        // User Request: "dietist can delete only his/her meals" -> covered by (meal.codUser === userId)
        // User Request: "superdmin can see everything" (and presumably manage) -> covered by (userRole === 1)
        if (meal.codUser !== userId && userRole !== 1) {
            return NextResponse.json({ error: 'Forbidden: You do not own this meal' }, { status: 403 });
        }

        await prisma.pastoAlimento.deleteMany({
            where: { codPasto: mealId }
        });

        await prisma.pasto.delete({
            where: { codicePasto: mealId }
        });

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        logger.error('Error deleting meal', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
