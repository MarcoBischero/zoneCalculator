import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// TEMPORARY ENDPOINT - DELETE AFTER USE
// Force dynamic to bypass middleware
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { secret } = await req.json();

        // Security check
        if (secret !== 'TEMP_PASSWORD_RESET_2025') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const newPasswordHash = '$2b$10$ogbIUaJ0JYvcMl9CFkcSXukBLeYsn9cchdR7pt49jlivSITYw3Xte';

        // Find Marco's user
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: 'marco.biscardi@gmail.com' },
                    { username: 'marco' },
                    { email: { contains: 'marco' } }
                ]
            }
        });

        if (!user) {
            return NextResponse.json({
                error: 'User not found',
                allUsers: await prisma.user.findMany({
                    take: 5,
                    select: { id: true, username: true, email: true }
                })
            }, { status: 404 });
        }

        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: { password: newPasswordHash }
        });

        return NextResponse.json({
            success: true,
            message: `Password updated for user: ${user.username} (${user.email})`,
            newPassword: 'woTcez-wimmy9-qidxac'
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
