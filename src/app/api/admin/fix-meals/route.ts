
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const ROLE_SUPER_ADMIN = 1;

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    // 1. Check Authentication
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check Authorization (RBAC)
    const userRole = Number(session.user.role);
    if (userRole !== ROLE_SUPER_ADMIN) {
        console.warn(`[Security] Unauthorized access attempt to fix-meals by user ${session.user.id} (Role: ${userRole})`);
        return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    try {
        // Map of old legacy indices to new numeric values (0-3)
        // Note: mealType is now Int (0=Colazione, 1=Spuntino, 2=Pranzo, 3=Cena)
        const legacyMap: Record<number, number> = {
            4: 3, // Cena (old index 4 -> new index 3)
            5: 1, // Spuntino 3 (old index 5 -> Spuntino, index 1)
        };

        const updates = [];

        // 1. Fetch all meals that need migration
        const meals = await prisma.pasto.findMany();
        let count = 0;

        for (const meal of meals) {
            // Check if mealType needs migration (values > 3)
            if (meal.mealType > 3 && legacyMap[meal.mealType]) {
                updates.push(prisma.pasto.update({
                    where: { codicePasto: meal.codicePasto },
                    data: { mealType: legacyMap[meal.mealType] }
                }));
                count++;
            }
        }

        if (updates.length > 0) {
            await prisma.$transaction(updates);
        }

        return NextResponse.json({
            success: true,
            message: `Migrated ${count} meals to new string format.`,
            totalChecked: meals.length
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
