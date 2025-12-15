import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const hash = await bcrypt.hash('woTcez-wimmy9-qidxac', 10);

        const result = await prisma.user.updateMany({
            where: {
                OR: [
                    { username: 'superadmin' },
                    { email: { contains: 'superadmin' } }
                ]
            },
            data: { password: hash }
        });

        if (result.count === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            updated: result.count,
            password: 'woTcez-wimmy9-qidxac'
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
