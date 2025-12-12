import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.email) {
        return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    try {
        const user = await prisma.user.findFirst({
            where: { email: session.user.email },
            select: {
                nome: true,
                cognome: true,
                email: true,
                language: true,
                username: true
            }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { language, nome, cognome } = body;

        const userId = parseInt(session.user.id);

        await prisma.user.update({
            where: { id: userId },
            data: {
                language,
                nome,
                cognome
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("User Update Error:", error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
