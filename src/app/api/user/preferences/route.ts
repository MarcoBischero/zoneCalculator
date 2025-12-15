import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * GET /api/user/preferences
 * Get user preferences
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findFirst({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const preferences = await prisma.userPreferences.findUnique({
            where: { userId: user.id }
        });

        // Return default values if no preferences exist yet
        if (!preferences) {
            return NextResponse.json({
                dietaryPreferences: [],
                allergies: [],
                intolerances: [],
                favoriteFoods: [],
                dislikedFoods: [],
                enableProactiveTips: true,
                enableEducationalMode: true
            });
        }

        return NextResponse.json({
            dietaryPreferences: JSON.parse(preferences.dietaryPreferences || '[]'),
            allergies: JSON.parse(preferences.allergies || '[]'),
            intolerances: JSON.parse(preferences.intolerances || '[]'),
            favoriteFoods: JSON.parse(preferences.favoritefoods || '[]'),
            dislikedFoods: JSON.parse(preferences.dislikedFoods || '[]'),
            enableProactiveTips: preferences.enableProactiveTips,
            enableEducationalMode: preferences.enableEducationalMode
        });

    } catch (error) {
        console.error('Error fetching preferences:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * PUT /api/user/preferences
 * Update user preferences
 */
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findFirst({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await req.json();
        const {
            dietaryPreferences,
            allergies,
            intolerances,
            favoriteFoods,
            dislikedFoods,
            enableProactiveTips,
            enableEducationalMode
        } = body;

        // Validate arrays
        const validateArray = (arr: any) => Array.isArray(arr) ? arr : [];

        const preferences = await prisma.userPreferences.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                dietaryPreferences: JSON.stringify(validateArray(dietaryPreferences)),
                allergies: JSON.stringify(validateArray(allergies)),
                intolerances: JSON.stringify(validateArray(intolerances)),
                favoritefoods: JSON.stringify(validateArray(favoriteFoods)),
                dislikedFoods: JSON.stringify(validateArray(dislikedFoods)),
                enableProactiveTips: enableProactiveTips ?? true,
                enableEducationalMode: enableEducationalMode ?? true
            },
            update: {
                dietaryPreferences: JSON.stringify(validateArray(dietaryPreferences)),
                allergies: JSON.stringify(validateArray(allergies)),
                intolerances: JSON.stringify(validateArray(intolerances)),
                favoritefoods: JSON.stringify(validateArray(favoriteFoods)),
                dislikedFoods: JSON.stringify(validateArray(dislikedFoods)),
                enableProactiveTips: enableProactiveTips ?? true,
                enableEducationalMode: enableEducationalMode ?? true
            }
        });

        return NextResponse.json({ success: true, preferences });

    } catch (error) {
        console.error('Error updating preferences:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
