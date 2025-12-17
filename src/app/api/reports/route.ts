
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
        // 1. Fetch Data Sources
        // Fetch Weight Logs (New System)
        const measurementLogs = await prisma.measurementLog.findMany({
            where: { userId },
            orderBy: { date: 'asc' },
            select: { date: true, weight: true },
            take: 20
        });

        // Fetch Protocol Needs (Old System + Current Target Source)
        const protNeeds = await prisma.protNeed.findMany({
            where: { codUser: userId },
            orderBy: { lastCheck: 'asc' },
            select: {
                lastCheck: true,
                peso: true,
                blocchi: true
            },
            take: 20
        });

        // 2. Determine Weight History Data
        let weightData: any[] = [];

        if (measurementLogs.length > 0) {
            // Use new logs if available
            weightData = measurementLogs.map(entry => ({
                date: new Date(entry.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
                weight: Number(entry.weight),
            }));
        } else {
            weightData = protNeeds.map((entry: any) => ({
                date: new Date(entry.lastCheck).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
                weight: entry.peso,
            }));
        }

        // 3. Determine Current Stats (Blocks, Weight)
        // Current blocks always come from the latest ProtNeed calculation (most reliable for "Target")
        // If no ProtNeed exists, default to 11
        const latestProtNeed = protNeeds.length > 0 ? protNeeds[protNeeds.length - 1] : null;
        let currentBlocks = latestProtNeed ? Number(latestProtNeed.blocchi) : 11;

        // Current Weight
        const currentWeight = weightData.length > 0 ? weightData[weightData.length - 1].weight : 0;
        const prevWeight = weightData.length > 1 ? weightData[weightData.length - 2].weight : currentWeight;
        const weightTrend = currentWeight - prevWeight;

        // 4. Block Adherence (Last 7 Days)
        // Using CalendarItems as "Planned/Eaten" proxy
        const calendarItems = await prisma.calendarItem.findMany({
            where: { idUser: userId },
            include: { pasto: { select: { blocks: true } } }
        });

        const dayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
        const adherenceMap = new Array(7).fill(0);

        calendarItems.forEach(item => {
            if (item.column >= 0 && item.column < 7) {
                // FIXED: Only count consumed blocks for adherence
                if (item.isConsumed) {
                    adherenceMap[item.column] += item.pasto.blocks;
                }
            }
        });

        const adherenceData = dayNames.map((day, idx) => ({
            day,
            consumed: adherenceMap[idx],
            target: currentBlocks
        }));

        // 5. Macro Split (Mock for Perfect Zone)
        const macroData = [
            { name: 'Proteine', value: 30, color: '#f97316' },
            { name: 'Carboidrati', value: 40, color: '#3b82f6' },
            { name: 'Grassi', value: 30, color: '#10b981' },
        ];

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
