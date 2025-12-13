import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Cache food data for 1 hour (3600 seconds)
// Foods are relatively static, so this reduces DB load significantly
export const revalidate = 3600;

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    // Allow public access or require session? Original code didn't check session explicitly in snippet (lines 1-38 shown), 
    // but imports suggest it might have. Actually line 10-37 in previous view_file(Step 17) didn't use session.
    // BUT the new requirements imply User contexts.
    // If request has no session, what to return? Public foods?
    // Let's check session. If public (no session), return everything (or nothing?).

    // NOTE: The previous code did NOT check session. It was public.
    // "posso abilitare entrambi i pacchetti dalle impostazioni specifiche dell'utente".
    // This implies logged in users.
    // I will add session check for the package logic. If no session, I might default to empty or all.
    // Given it's a "Calculator", probably public needs at least base foods?
    // Let's assume usage requires login mostly, or public uses "Base" implicitly.
    // Check if session exists.

    let userPkgIds: number[] = [];
    let hasPackages = false;
    let isAdmin = false;

    if (session && session.user) {
        // Fetch User Packages
        const userId = parseInt(session.user.id);
        const userRole = (session.user as any).role;
        isAdmin = (userRole === 1);

        if (!isAdmin) {
            const userPackages = await prisma.userPackage.findMany({
                where: {
                    userId: userId,
                    package: { type: 'FOOD' }
                },
                include: { package: { include: { items: { select: { foodId: true } } } } }
            });

            if (userPackages.length > 0) {
                hasPackages = true;
                // Extract all food IDs
                const ids = new Set<number>();
                userPackages.forEach((up: any) => {
                    up.package.items.forEach((item: any) => {
                        if (item.foodId) ids.add(item.foodId);
                    });
                });
                userPkgIds = Array.from(ids);
            }
        }
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const take = parseInt(searchParams.get('take') || '10');

    // Construct where clause
    const whereClause: any = {};
    if (q) {
        whereClause.nome = { contains: q };
    }

    // PACKAGE FILTERING LOGIC
    if (!isAdmin && hasPackages) {
        // Check if we already have a clause
        // We need to AND the package restriction
        whereClause.codiceAlimento = { in: userPkgIds };
    }
    // If (!isAdmin && !hasPackages), we fall back to "Show All" (Legacy) 
    // OR we could show "None" if we wanted strictness. 
    // Implementation Decision: Show All for transition.

    try {
        const foods = await prisma.alimento.findMany({
            where: whereClause,
            orderBy: { nome: 'asc' },
            take: take,
        });
        return NextResponse.json(foods);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch foods' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nome, proteine, carboidrati, grassi, codTipo, codFonte } = body;

        const newFood = await prisma.alimento.create({
            data: {
                nome,
                proteine: parseFloat(proteine),
                carboidrati: parseFloat(carboidrati),
                grassi: parseFloat(grassi),
                codTipo: parseInt(codTipo || '0'),
                codFonte: parseInt(codFonte || '0')
            }
        });
        return NextResponse.json(newFood);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create food' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, nome, proteine, carboidrati, grassi } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const updated = await prisma.alimento.update({
            where: { codiceAlimento: parseInt(id) },
            data: {
                nome,
                proteine: parseFloat(proteine),
                carboidrati: parseFloat(carboidrati),
                grassi: parseFloat(grassi),
            }
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Update food error:', error);
        return NextResponse.json({ error: 'Failed to update food' }, { status: 500 });
    }
}
