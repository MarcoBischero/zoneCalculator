import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { passwordChangeSchema } from '@/lib/validation';

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        // SECURITY: Validate password complexity
        const validation = passwordChangeSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                error: 'Password does not meet requirements',
                details: validation.error.errors.map(e => e.message)
            }, { status: 400 });
        }

        const { password } = validation.data;

        // SECURITY FIX: Use bcrypt instead of MD5
        // bcrypt is the industry standard for password hashing
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);

        const userId = parseInt(session.user.id);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Password update error:', error);
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }
}
