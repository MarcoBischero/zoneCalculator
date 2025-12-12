
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, role } = session.user as any;
    const userId = Number(id);

    // Get My Dietician ID to find "Local" (Clinic) peers
    const me = await prisma.user.findUnique({
        where: { id: userId },
        select: { dieticianId: true }
    });

    try {
        // 1. Global Leaderboard (Top 50)
        const globalRaw = await prisma.gamificationProfile.findMany({
            take: 50,
            orderBy: { points: 'desc' },
            include: { user: { select: { username: true } } }
        });

        // 2. Local Leaderboard (Clinic)
        let localRaw: any[] = [];
        if (me?.dieticianId) {
            localRaw = await prisma.gamificationProfile.findMany({
                where: { user: { dieticianId: me.dieticianId } },
                take: 50,
                orderBy: { points: 'desc' },
                include: { user: { select: { username: true } } }
            });
        } else {
            // If I don't have a dietician, maybe I AM a dietician? 
            // If I am a Dietician, "Local" means MY patients.
            // If I'm role=2 (Dietician)
            localRaw = await prisma.gamificationProfile.findMany({
                where: { user: { dieticianId: userId } },
                take: 50,
                orderBy: { points: 'desc' },
                include: { user: { select: { username: true } } }
            });
        }

        const mapProfile = (p: any, i: number) => ({
            rank: i + 1,
            username: p.user.username,
            points: p.points,
            level: p.level,
            streak: p.streak
        });

        return NextResponse.json({
            global: globalRaw.map(mapProfile),
            local: localRaw.map(mapProfile)
        });

    } catch (e) {
        console.error("Leaderboard Error", e);
        return NextResponse.json({ global: [], local: [] });
    }
}
