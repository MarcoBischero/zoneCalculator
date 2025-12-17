import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { day, type, status } = await req.json();

        // 1. Find the User
        const user = await prisma.user.findFirst({
            where: { email: session.user.email }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // 2. Map day string to column index (0-6)
        const days = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
        const columnIndex = days.indexOf(day);

        // 3. Map type string to order index (similar to Calendar logic)
        // Order logic: Colazione (0), Spuntino 1 (1), Pranzo (2), Spuntino 2 (3), Cena (4), Spuntino 3 (5)
        let orderIndex = -1;
        if (type === 'Colazione') orderIndex = 0;
        else if (type === 'Spuntino Mattina' || type === 'Spuntino 1') orderIndex = 1;
        else if (type === 'Pranzo') orderIndex = 2;
        else if (type === 'Spuntino Pomeriggio' || type === 'Spuntino 2') orderIndex = 3;
        else if (type === 'Cena') orderIndex = 4;
        else if (type === 'Spuntino Sera' || type === 'Spuntino 3') orderIndex = 5;

        if (columnIndex === -1 || orderIndex === -1) {
            return NextResponse.json({ error: 'Invalid Coordinates' }, { status: 400 });
        }

        // 4. Update the item
        // Find existing item first
        const item = await prisma.calendarItem.findFirst({
            where: {
                idUser: user.id,
                column: columnIndex,
                order: orderIndex
            }
        });

        if (!item) {
            return NextResponse.json({ error: 'Meal not found in calendar' }, { status: 404 });
        }

        // Update
        await prisma.calendarItem.update({
            where: { id: item.id },
            data: { isConsumed: status }
        });

        return NextResponse.json({ success: true, isConsumed: status });

    } catch (error) {
        console.error("Toggle consumed error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
