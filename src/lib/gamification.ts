
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

        // Local limit check to prevent massive spam (optional, good practice)
        // ...

        // ATOMIC UPSERT: Handles Race Conditions by letting the DB manage concurrency
        const profile = await prisma.gamificationProfile.upsert({
            where: { userId },
            create: {
                userId,
                lifetimeXp: action.points,
                level: 1,
                lastActionDate: new Date()
            },
            update: {
                lifetimeXp: { increment: action.points },
                lastActionDate: new Date()
            }
        });

        // Level Sync (Post-Atomic Update)
        // If points incremented, we check if level needs update.
        // This is safe because points are already secured.
        const expectedLevel = Math.floor(profile.lifetimeXp / 100) + 1;
        if (profile.level !== expectedLevel) {
            await prisma.gamificationProfile.update({
                where: { userId },
                data: { level: expectedLevel }
            });
            // Update local object for logging
            profile.level = expectedLevel;
        }

        console.log(`[GAMIFICATION] User ${userId} awarded ${action.points} pts for ${action.label}. Total: ${profile.lifetimeXp} (Lvl ${profile.level})`); // Log from DB profile



    } catch (e) {
        console.error("[GAMIFICATION ERROR]", e);
    }
}
