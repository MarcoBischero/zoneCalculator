import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET assigned packages for a user
export async function GET(request: Request, context: any) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const params = await context.params;
    const targetUserId = parseInt(params.id);
    const requesterId = parseInt(session.user.id);
    const requesterRole = (session.user as any).role;

    // Access Control: 
    // - Self
    // - Dietician of the user (need to check relation)
    // - Admin

    if (requesterId !== targetUserId && requesterRole !== 1) {
        // Check if dietician
        const user = await prisma.user.findUnique({ where: { id: targetUserId }, select: { dieticianId: true } });
        if (user?.dieticianId !== requesterId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
    }

    const assigned = await prisma.userPackage.findMany({
        where: { userId: targetUserId },
        include: {
            package: true
        }
    });

    return NextResponse.json(assigned.map((ap: any) => ap.package));
}

// Assign/Unassign
export async function POST(request: Request, context: any) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const params = await context.params;
    const userId = parseInt(params.id);
    const currentUser = session.user as any;

    // Only Admin or Dietician can assign
    if (currentUser.role !== 1 && currentUser.role !== 2) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Dietician check
    if (currentUser.role === 2) {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { dieticianId: true } });
        if (user?.dieticianId !== parseInt(currentUser.id)) {
            return NextResponse.json({ error: 'Forbidden: Not your patient' }, { status: 403 });
        }
    }

    try {
        const body = await request.json();
        const { packageId, action } = body; // action: 'assign' | 'remove'

        if (!packageId || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        if (action === 'assign') {
            await prisma.userPackage.create({
                data: {
                    userId: userId,
                    packageId: parseInt(packageId),
                    assignedBy: parseInt(session.user.id)
                }
            });
        } else if (action === 'remove') {
            await prisma.userPackage.deleteMany({
                where: {
                    userId: userId,
                    packageId: parseInt(packageId)
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
    }
}
