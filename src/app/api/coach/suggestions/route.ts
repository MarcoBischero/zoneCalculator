import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import {
    generateSuggestions,
    getActiveSuggestions,
    markSuggestionRead,
    dismissSuggestion
} from '@/lib/coach-engine';

/**
 * GET /api/coach/suggestions
 * Get active suggestions for user
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

        const suggestions = await getActiveSuggestions(user.id);

        return NextResponse.json(suggestions);

    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST /api/coach/suggestions
 * Generate new suggestions for user (rate limited to once per day)
 */
export async function POST() {
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

        const generated = await generateSuggestions(user.id);

        if (generated) {
            const suggestions = await getActiveSuggestions(user.id);
            return NextResponse.json({
                generated: true,
                count: suggestions.length,
                suggestions
            });
        } else {
            return NextResponse.json({
                generated: false,
                message: 'Suggestions already generated today or proactive tips disabled'
            });
        }

    } catch (error) {
        console.error('Error generating suggestions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * PATCH /api/coach/suggestions
 * Mark suggestion as read or dismissed
 */
export async function PATCH(req: Request) {
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
        const { id, action } = body;

        if (!id || !action) {
            return NextResponse.json({ error: 'ID and action are required' }, { status: 400 });
        }

        // Verify suggestion belongs to user
        const suggestion = await prisma.coachSuggestion.findUnique({
            where: { id: parseInt(id) }
        });

        if (!suggestion || suggestion.userId !== user.id) {
            return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
        }

        let updated;
        if (action === 'read') {
            updated = await markSuggestionRead(parseInt(id));
        } else if (action === 'dismiss') {
            updated = await dismissSuggestion(parseInt(id));
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json(updated);

    } catch (error) {
        console.error('Error updating suggestion:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
