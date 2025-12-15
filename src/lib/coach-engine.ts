import { prisma } from '@/lib/prisma';
import { buildMealContext, buildUserContext } from './context-builder';

/**
 * ZoneMentor Coach Engine
 * 
 * Analyzes user data and generates proactive coaching suggestions
 */

export type SuggestionType =
    | 'LOW_PROTEIN'
    | 'LOW_CARBS'
    | 'LOW_FATS'
    | 'MACRO_IMBALANCE'
    | 'EXCEEDING_BLOCKS'
    | 'STREAK_REMINDER'
    | 'HYDRATION_REMINDER'
    | 'MEAL_TIMING'
    | 'GENERAL_TIP';

export type SuggestionPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Suggestion {
    type: SuggestionType;
    message: string;
    priority: SuggestionPriority;
    metadata?: any;
}

/**
 * Analyze user's day and generate suggestions
 * Returns true if suggestions were generated
 */
export async function generateSuggestions(userId: number): Promise<boolean> {
    // Check if suggestions already generated today
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            preferences: true
        }
    });

    if (!user) return false;

    // Check if user has proactive tips enabled
    if (user.preferences && !user.preferences.enableProactiveTips) {
        return false;
    }

    // Check last suggestion date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.preferences?.lastSuggestionDate) {
        const lastSuggestion = new Date(user.preferences.lastSuggestionDate);
        lastSuggestion.setHours(0, 0, 0, 0);

        // Already generated today
        if (lastSuggestion.getTime() === today.getTime()) {
            return false;
        }
    }

    // Get user context
    const [userContext, mealContext] = await Promise.all([
        buildUserContext(userId),
        buildMealContext(userId, 7)
    ]);

    const suggestions: Suggestion[] = [];

    // Analyze and generate suggestions
    suggestions.push(...analyzeProteinIntake(userContext, mealContext));
    suggestions.push(...analyzeMacroBalance(mealContext));
    suggestions.push(...analyzeBlockProgress(mealContext));
    const streakSuggestions = await checkStreak(userId);
    suggestions.push(...streakSuggestions);

    // Save suggestions to database
    if (suggestions.length > 0) {
        await prisma.coachSuggestion.createMany({
            data: suggestions.map(s => ({
                userId,
                type: s.type,
                message: s.message,
                priority: s.priority,
                metadata: s.metadata ? JSON.stringify(s.metadata) : null
            }))
        });

        // Update last suggestion date
        await prisma.userPreferences.upsert({
            where: { userId },
            create: {
                userId,
                lastSuggestionDate: today
            },
            update: {
                lastSuggestionDate: today
            }
        });

        return true;
    }

    return false;
}

/**
 * Analyze protein intake
 */
function analyzeProteinIntake(userContext: any, mealContext: any): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const { blocks } = userContext;
    const { todayProtein, todayBlocks, targetBlocks } = mealContext;

    const targetProtein = blocks * 7; // 7g protein per block
    const proteinPercentage = (todayProtein / targetProtein) * 100;

    // It's past lunch time (after 1 PM) and protein is < 40%
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 13 && proteinPercentage < 40) {
        suggestions.push({
            type: 'LOW_PROTEIN',
            message: `🍗 You've only had ${todayProtein}g of protein today (target: ${targetProtein}g). Consider adding lean protein to your next meal!`,
            priority: 'HIGH',
            metadata: { current: todayProtein, target: targetProtein }
        });
    } else if (hour >= 18 && proteinPercentage < 60) {
        suggestions.push({
            type: 'LOW_PROTEIN',
            message: `💪 Evening check: ${todayProtein}g/${targetProtein}g protein. Add some yogurt greco or turkey breast for dinner?`,
            priority: 'MEDIUM',
            metadata: { current: todayProtein, target: targetProtein }
        });
    }

    return suggestions;
}

/**
 * Analyze macronutrient balance
 */
function analyzeMacroBalance(mealContext: any): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const { todayProtein, todayCarbs, todayFats } = mealContext;

    if (todayProtein === 0 && todayCarbs === 0 && todayFats === 0) {
        return suggestions; // No meals logged yet
    }

    // Zone Diet ideal ratio: 30% protein, 40% carbs, 30% fats (by calories)
    // 1g protein = 4 cal, 1g carbs = 4 cal, 1g fat = 9 cal
    const proteinCal = todayProtein * 4;
    const carbsCal = todayCarbs * 4;
    const fatsCal = todayFats * 9;
    const totalCal = proteinCal + carbsCal + fatsCal;

    if (totalCal === 0) return suggestions;

    const proteinPercent = (proteinCal / totalCal) * 100;
    const carbsPercent = (carbsCal / totalCal) * 100;
    const fatsPercent = (fatsCal / totalCal) * 100;

    // Check if fats are too high (> 40% of calories)
    if (fatsPercent > 40) {
        suggestions.push({
            type: 'MACRO_IMBALANCE',
            message: `⚖️ Your fat intake is high today (${Math.round(fatsPercent)}% of calories). Zone Diet recommends ~30%. Try leaner proteins!`,
            priority: 'MEDIUM',
            metadata: { fatsPercent: Math.round(fatsPercent) }
        });
    }

    // Check if carbs are too low (< 30% of calories)
    if (carbsPercent < 30 && totalCal > 500) {
        suggestions.push({
            type: 'MACRO_IMBALANCE',
            message: `🍎 Your carbs are a bit low today (${Math.round(carbsPercent)}%). Add some vegetables or fruit to stay balanced!`,
            priority: 'LOW',
            metadata: { carbsPercent: Math.round(carbsPercent) }
        });
    }

    return suggestions;
}

/**
 * Analyze block progress
 */
function analyzeBlockProgress(mealContext: any): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const { todayBlocks, targetBlocks } = mealContext;

    if (targetBlocks === 0) return suggestions;

    const percentage = (todayBlocks / targetBlocks) * 100;
    const now = new Date();
    const hour = now.getHours();

    // Exceeding blocks
    if (percentage > 110) {
        suggestions.push({
            type: 'EXCEEDING_BLOCKS',
            message: `📊 You've consumed ${todayBlocks}/${targetBlocks} blocks today (${Math.round(percentage)}%). Consider lighter options for remaining meals.`,
            priority: 'HIGH',
            metadata: { current: todayBlocks, target: targetBlocks }
        });
    }

    // Behind on blocks in the evening
    if (hour >= 19 && percentage < 70) {
        suggestions.push({
            type: 'GENERAL_TIP',
            message: `🌙 Evening reminder: You're at ${todayBlocks}/${targetBlocks} blocks. Make sure to eat enough before bed!`,
            priority: 'MEDIUM',
            metadata: { current: todayBlocks, target: targetBlocks }
        });
    }

    return suggestions;
}

/**
 * Check user streak and send reminder
 */
async function checkStreak(userId: number): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];

    const gamification = await prisma.gamificationProfile.findUnique({
        where: { userId }
    });

    if (!gamification) return suggestions;

    // Check if user logged in yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const lastAction = new Date(gamification.lastAction);
    lastAction.setHours(0, 0, 0, 0);

    const daysSinceLastAction = Math.floor(
        (Date.now() - lastAction.getTime()) / (1000 * 60 * 60 * 24)
    );

    // About to lose streak
    if (gamification.streak >= 3 && daysSinceLastAction === 1) {
        suggestions.push({
            type: 'STREAK_REMINDER',
            message: `🔥 Don't break your ${gamification.streak}-day streak! Log a meal today to keep it going!`,
            priority: 'HIGH',
            metadata: { streak: gamification.streak }
        });
    }

    return suggestions;
}

/**
 * Get active suggestions for user
 */
export async function getActiveSuggestions(userId: number) {
    return await prisma.coachSuggestion.findMany({
        where: {
            userId,
            isRead: false,
            isDismissed: false
        },
        orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' }
        ],
        take: 5
    });
}

/**
 * Mark suggestion as read
 */
export async function markSuggestionRead(suggestionId: number) {
    return await prisma.coachSuggestion.update({
        where: { id: suggestionId },
        data: { isRead: true }
    });
}

/**
 * Dismiss suggestion
 */
export async function dismissSuggestion(suggestionId: number) {
    return await prisma.coachSuggestion.update({
        where: { id: suggestionId },
        data: { isDismissed: true, isRead: true }
    });
}
