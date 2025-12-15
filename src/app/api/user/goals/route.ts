import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * GET /api/user/goals
 * Get active nutrition goals for user
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

        const goals = await prisma.nutritionGoal.findMany({
            where: {
                userId: user.id,
                isActive: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(goals);

    } catch (error) {
        console.error('Error fetching goals:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST /api/user/goals
 * Create new nutrition goal
 */
export async function POST(req: Request) {
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
        const { goalType, targetWeight, targetDate, notes } = body;

        if (!goalType) {
            return NextResponse.json({ error: 'Goal type is required' }, { status: 400 });
        }

        const goal = await prisma.nutritionGoal.create({
            data: {
                userId: user.id,
                goalType,
                targetWeight: targetWeight ? parseInt(targetWeight) : null,
                targetDate: targetDate ? new Date(targetDate) : null,
                notes: notes || null,
                isActive: true
            }
        });

        return NextResponse.json(goal);

    } catch (error) {
        console.error('Error creating goal:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * PUT /api/user/goals
 * Update existing goal
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
        const { id, goalType, targetWeight, targetDate, notes, isActive } = body;

        if (!id) {
            return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
        }

        // Verify goal belongs to user
        const existingGoal = await prisma.nutritionGoal.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingGoal || existingGoal.userId !== user.id) {
            return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
        }

        const goal = await prisma.nutritionGoal.update({
            where: { id: parseInt(id) },
            data: {
                ...(goalType && { goalType }),
                ...(targetWeight !== undefined && { targetWeight: targetWeight ? parseInt(targetWeight) : null }),
                ...(targetDate !== undefined && { targetDate: targetDate ? new Date(targetDate) : null }),
                ...(notes !== undefined && { notes }),
                ...(isActive !== undefined && { isActive })
            }
        });

        return NextResponse.json(goal);

    } catch (error) {
        console.error('Error updating goal:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * DELETE /api/user/goals
 * Delete goal
 */
export async function DELETE(req: Request) {
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

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
        }

        // Verify goal belongs to user
        const existingGoal = await prisma.nutritionGoal.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingGoal || existingGoal.userId !== user.id) {
            return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
        }

        await prisma.nutritionGoal.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting goal:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
