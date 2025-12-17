import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Parse body to see if a targetId is provided (Admin mode)
        const body = await req.json().catch(() => ({}));
        const { targetId } = body;

        // Current user
        const currentUser = await prisma.user.findFirst({
            where: { email: session.user.email },
            include: { ruolo: true }
        });

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let idToDelete = currentUser.id;

        // If targetId provided, check if Admin
        if (targetId) {
            // Check if SuperAdmin (Role ID 1)
            if (currentUser.idRuolo !== 1 && currentUser.email !== 'marco.biscardi@gmail.com') { // Safety check incase ID changes
                return NextResponse.json({ error: 'Forbidden: Only Admins can delete other users' }, { status: 403 });
            }
            idToDelete = parseInt(targetId);
        }

        await prisma.user.delete({
            where: { id: idToDelete }
        });

        return NextResponse.json({ message: 'Account deleted' });
    } catch (error) {
        console.error("Delete user error:", error);
        return NextResponse.json({ error: 'Error deleting account' }, { status: 500 });
    }
}
