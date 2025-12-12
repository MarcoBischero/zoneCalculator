
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
        // Map of old legacy indices to new string values
        const legacyMap: Record<string, string> = {
            "0": "Colazione",
            "1": "Spuntino 1",
            "2": "Pranzo",
            "3": "Spuntino 2",
            "4": "Cena",
            "5": "Spuntino 3"
        };

        const updates = [];

        // 1. Fetch all meals
        const meals = await prisma.pasto.findMany();
        let count = 0;

        for (const meal of meals) {
            // Check if mealType matches a legacy key
            if (legacyMap[meal.mealType]) {
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
