import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = params;
        const foodId = parseInt(id);

        if (isNaN(foodId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        // Optional: Check if used in meals? 
        // Prisma might throw constraint error if no cascade delete.
        // Let's try delete.

        await prisma.alimento.delete({
            where: { codiceAlimento: foodId }
        });

        return NextResponse.json({ message: 'Food deleted' });
    } catch (error) {
        console.error("Delete food error:", error);
        return NextResponse.json({ error: 'Error deleting food. It might be in use by a meal.' }, { status: 500 });
    }
}
