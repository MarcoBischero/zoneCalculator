import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        // Extract all fields including gender-specific ones
        const {
            weight, height, neck, abdomen, waist, hips, wrist, forearm,
            activity, blocks, bodyFat, dailyProtein, leanMass
        } = body;

        const user = await prisma.user.findFirst({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Save to ProtNeed with all measurements
        const record = await prisma.protNeed.create({
            data: {
                codUser: user.id,
                peso: Math.round(weight || 0),
                altezza: Math.round(height || 0),
                collo: Math.round(neck || 0),
                // Male-specific
                addome: abdomen ? Math.round(abdomen) : null,
                // Female-specific
                vita: waist ? Math.round(waist) : null,
                anche: hips ? Math.round(hips) : null,
                polso: wrist ? Math.round(wrist) : null,
                avambraccio: forearm ? Math.round(forearm) : null,
                // Activity and results
                moltiplicatore: activity || '1.3',
                blocchi: Math.round(blocks || 0),
                percentualeMM: parseFloat((100 - bodyFat).toFixed(1)),
                percentualeMG: parseFloat(bodyFat.toFixed(1)),
                proteineDay: parseFloat(dailyProtein.toFixed(1)),
                lastCheck: new Date(),
            }
        });

        return NextResponse.json({ success: true, id: record.codiceProtneed });
    } catch (error) {
        console.error('Error saving protein needs:', error);
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }
}
