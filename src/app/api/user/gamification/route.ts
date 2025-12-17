import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    try {
        const profile = await prisma.gamificationProfile.findUnique({
            where: { userId }
        });

        if (!profile) {
            // Default if no profile exists
            return NextResponse.json({
                level: 1,
                currentXp: 0,
                nextLevelXp: 100,
                lifetimeXp: 0,
                streak: 0
            });
        }

        const currentXp = profile.lifetimeXp % 100;
        const nextLevelXp = 100;

        return NextResponse.json({
            level: profile.level,
            currentXp: currentXp,
            nextLevelXp: nextLevelXp,
            lifetimeXp: profile.lifetimeXp,
            streak: profile.currentStreak
        });

    } catch (e) {
        console.error("Gamification Stats Error", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
