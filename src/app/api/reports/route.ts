
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number((session.user as any).id);

    try {
        // 1. Weight History (from ProtNeed)
        const weightHistory = await prisma.protNeed.findMany({
            where: { codUser: userId },
            orderBy: { lastCheck: 'asc' },
            select: {
                lastCheck: true,
                peso: true,
                blocchi: true // Target blocks at that time
            },
            take: 20 // Last 20 checks
        });

        // Format for Chart
        const weightData = weightHistory.map(entry => ({
            date: new Date(entry.lastCheck).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
            weight: entry.peso,
            targetBlocks: entry.blocchi
        }));

        // 2. Block Adherence (Last 7 Days)
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - 6); // Last 7 days

        // Get Meals logged in Calendar
        // CalendarItem uses 'column' (0=Mon, 6=Sun) or similar.
        // Actually, CalendarItem is a "Plan", not necessarily a "Log".
        // BUT, the dashboard "Recent Meals" uses Logged Meals.
        // For Adherence, we should ideally check "What did I eat today?".
        // If we don't have a "Log Log", we might have to use Calendar as "Planned vs Target".
        // Let's assume CalendarItems are the "Planned/Eaten" meals for now if no specific Log table exists.

        // Wait, 'Pasto' has 'codUser'. But Pasto is a recipe.
        // 'CalendarItem' links User + Pasto to a 'col' (Day) and 'order'.
        // Let's use CalendarItems to estimate "Planned Week".

        const calendarItems = await prisma.calendarItem.findMany({
            where: { idUser: userId },
            include: { pasto: { select: { blocks: true } } }
        });

        // Group by Day (0-6)
        // Note: Calendar 'column' 0 usually is Monday in this app based on previous views.
        const dayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
        const currentBlocks = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].blocchi : 11; // Default 11

        const adherenceMap = new Array(7).fill(0);

        calendarItems.forEach(item => {
            // item.column is 0..6
            if (item.column >= 0 && item.column < 7) {
                adherenceMap[item.column] += item.pasto.blocks;
            }
        });

        const adherenceData = dayNames.map((day, idx) => ({
            day,
            consumed: adherenceMap[idx],
            target: currentBlocks
        }));

        // 3. Macro Split (Mock for now, as we assume Perfect Zone 40/30/30 for Zone Meals)
        const macroData = [
            { name: 'Proteine', value: 30, color: '#f97316' },
            { name: 'Carboidrati', value: 40, color: '#3b82f6' },
            { name: 'Grassi', value: 30, color: '#10b981' },
        ];

        // 4. Current Stats
        const currentWeight = weightData.length > 0 ? weightData[weightData.length - 1].weight : 0;
        const prevWeight = weightData.length > 1 ? weightData[weightData.length - 2].weight : currentWeight;
        const weightTrend = currentWeight - prevWeight;

        return NextResponse.json({
            weightData,
            adherenceData,
            macroData,
            currentWeight,
            weightTrend,
            currentBlocks
        });

    } catch (e) {
        console.error("Reports Error", e);
        return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }
}
