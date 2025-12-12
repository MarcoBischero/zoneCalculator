
import { prisma } from "@/lib/prisma";

export const GAMIFICATION_ACTIONS = {
    LOGIN: { points: 5, label: "Accesso Giornaliero" },
    LOG_MEAL: { points: 10, label: "Pasto Registrato" },
    STREAK_BONUS: { points: 50, label: "Bonus Costanza" },
    PERFECT_DAY: { points: 20, label: "Giornata Perfetta" }
};

export async function awardPoints(userId: number, actionKey: keyof typeof GAMIFICATION_ACTIONS) {
    if (!userId) return;

    try {
        const action = GAMIFICATION_ACTIONS[actionKey];
        if (!action) return;

        // Get Schema Data
        const profile = await prisma.gamificationProfile.findUnique({
            where: { userId }
        });

        if (!profile) {
            // Should exist from user creation, but fallback safety
            await prisma.gamificationProfile.create({
                data: { userId, points: action.points }
            });
            return;
        }

        // Calculate New State
        const newPoints = profile.points + action.points;
        const newLevel = Math.floor(newPoints / 100) + 1; // Simple Leveling: Every 100 pts

        // Streak Logic could go here (e.g. check lastAction date)

        await prisma.gamificationProfile.update({
            where: { userId },
            data: {
                points: newPoints,
                level: newLevel,
                lastAction: new Date()
            }
        });

        console.log(`[GAMIFICATION] User ${userId} awarded ${action.points} pts for ${action.label}. Total: ${newPoints} (Lvl ${newLevel})`);

    } catch (e) {
        console.error("[GAMIFICATION ERROR]", e);
    }
}
