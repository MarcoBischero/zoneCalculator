import { prisma } from '@/lib/prisma';

/**
 * ZoneMentor Context Builder
 * 
 * Builds rich context for AI prompt injection including:
 * - User profile (name, blocks, weight, goals)
 * - Dietary preferences and restrictions
 * - Recent meal history
 * - Daily nutrition summary
 */

export interface UserContext {
    name: string;
    blocks: number;
    weight?: number;
    preferences?: {
        dietary?: string[];
        allergies?: string[];
        intolerances?: string[];
        favorites?: string[];
        dislikes?: string[];
    };
    goals?: {
        type: string;
        targetWeight?: number;
        targetDate?: Date;
        notes?: string;
    }[];
}

export interface MealContext {
    todayBlocks: number;
    todayProtein: number;
    todayCarbs: number;
    todayFats: number;
    targetBlocks: number;
    recentMeals: {
        name: string;
        blocks: number;
        time?: Date;
    }[];
    weeklyPattern?: string;
}

/**
 * Build comprehensive user context for AI
 */
export async function buildUserContext(userId: number): Promise<UserContext> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            protNeeds: {
                orderBy: { lastCheck: 'desc' },
                take: 1
            },
            preferences: true,
            goals: {
                where: { isActive: true },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    const profile = user.protNeeds?.[0];
    const prefs = user.preferences;

    return {
        name: user.nome || 'User',
        blocks: profile?.blocchi || 0,
        weight: profile?.peso,
        preferences: prefs ? {
            dietary: parseJSON(prefs.dietaryPreferences),
            allergies: parseJSON(prefs.allergies),
            intolerances: parseJSON(prefs.intolerances),
            favorites: parseJSON(prefs.favoritefoods),
            dislikes: parseJSON(prefs.dislikedFoods)
        } : undefined,
        goals: user.goals.map(g => ({
            type: g.goalType,
            targetWeight: g.targetWeight || undefined,
            targetDate: g.targetDate || undefined,
            notes: g.notes || undefined
        }))
    };
}

/**
 * Build meal context including today's nutrition and recent history
 */
export async function buildMealContext(userId: number, days: number = 7): Promise<MealContext> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            protNeeds: {
                orderBy: { lastCheck: 'desc' },
                take: 1
            }
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    const targetBlocks = user.protNeeds?.[0]?.blocchi || 0;

    // Get today's meals from calendar
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCalendarItems = await prisma.calendarItem.findMany({
        where: {
            idUser: userId,
            lastUpdateDate: {
                gte: today
            }
        },
        include: {
            pasto: {
                include: {
                    alimenti: {
                        include: {
                            alimento: true
                        }
                    }
                }
            }
        }
    });

    // Calculate today's totals
    let todayBlocks = 0;
    let todayProtein = 0;
    let todayCarbs = 0;
    let todayFats = 0;

    todayCalendarItems.forEach(item => {
        todayBlocks += item.pasto.blocks;
        item.pasto.alimenti.forEach(pa => {
            const grams = pa.grAlimento;
            todayProtein += (pa.alimento.proteine * grams) / 100;
            todayCarbs += (pa.alimento.carboidrati * grams) / 100;
            todayFats += (pa.alimento.grassi * grams) / 100;
        });
    });

    // Get recent meals (last N days)
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    const recentMeals = await prisma.pasto.findMany({
        where: {
            codUser: userId,
            calendarItems: {
                some: {
                    lastUpdateDate: {
                        gte: daysAgo
                    }
                }
            }
        },
        orderBy: { codicePasto: 'desc' },
        take: 10,
        include: {
            calendarItems: {
                orderBy: { lastUpdateDate: 'desc' },
                take: 1
            }
        }
    });

    return {
        todayBlocks,
        todayProtein: Math.round(todayProtein),
        todayCarbs: Math.round(todayCarbs),
        todayFats: Math.round(todayFats),
        targetBlocks,
        recentMeals: recentMeals.map(m => ({
            name: m.nome,
            blocks: m.blocks,
            time: m.calendarItems[0]?.lastUpdateDate
        }))
    };
}

/**
 * Build educational system prompt
 */
export function buildEducationalPrompt(
    userContext: UserContext,
    mealContext: MealContext,
    enableEducational: boolean = true
): string {
    const { name, blocks, weight, preferences, goals } = userContext;
    const { todayBlocks, todayProtein, todayCarbs, todayFats, targetBlocks, recentMeals } = mealContext;

    let prompt = `You are "ZoneMentor", an expert Zone Diet nutritionist and motivational coach.

USER PROFILE:
- Name: ${name}
- Daily Target: ${blocks} blocks (${blocks * 7}g protein)
- Current Weight: ${weight ? `${weight}kg` : 'not set'}`;

    if (goals && goals.length > 0) {
        prompt += `\n- Goals: ${goals.map(g => {
            const parts = [g.type.replace(/_/g, ' ').toLowerCase()];
            if (g.targetWeight) parts.push(`target ${g.targetWeight}kg`);
            if (g.notes) parts.push(g.notes);
            return parts.join(', ');
        }).join('; ')}`;
    }

    if (preferences) {
        if (preferences.dietary && preferences.dietary.length > 0) {
            prompt += `\n- Dietary Preferences: ${preferences.dietary.join(', ')}`;
        }
        if (preferences.allergies && preferences.allergies.length > 0) {
            prompt += `\n- ALLERGIES (NEVER suggest): ${preferences.allergies.join(', ')}`;
        }
        if (preferences.intolerances && preferences.intolerances.length > 0) {
            prompt += `\n- Intolerances (avoid): ${preferences.intolerances.join(', ')}`;
        }
    }

    prompt += `

TODAY'S NUTRITION:
- Blocks Consumed: ${todayBlocks}/${targetBlocks} (${Math.round((todayBlocks / targetBlocks) * 100)}%)
- Protein: ${todayProtein}g / ${blocks * 7}g
- Carbs: ${todayCarbs}g
- Fats: ${todayFats}g`;

    if (recentMeals.length > 0) {
        prompt += `\n\nRECENT MEALS:\n${recentMeals.slice(0, 5).map(m => `- ${m.name} (${m.blocks} blocks)`).join('\n')}`;
    }

    if (enableEducational) {
        prompt += `

COACHING STYLE:
- Always explain the "WHY" behind your recommendations (Zone Diet principles: insulin control, anti-inflammatory, hormonal balance)
- Reference specific user data when giving advice
- Be motivating and encouraging
- Provide actionable, specific suggestions
- Use emojis 🐿️ to keep it friendly
- If user is off-track, be supportive not judgmental`;
    } else {
        prompt += `

COACHING STYLE:
- Be concise and actionable
- Use emojis 🐿️
- Stay positive and motivating`;
    }

    return prompt;
}

/**
 * Helper to parse JSON strings safely
 */
function parseJSON(value: string | null | undefined): string[] {
    if (!value) return [];
    try {
        return JSON.parse(value);
    } catch {
        return [];
    }
}
