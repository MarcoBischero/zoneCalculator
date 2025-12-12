import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Cache food data for 1 hour (3600 seconds)
// Foods are relatively static, so this reduces DB load significantly
export const revalidate = 3600;

export async function GET(request: Request) {
    // Public endpoint for searching foods

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const take = parseInt(searchParams.get('take') || '10');

    // If no query, return default page
    // if (!q) { return NextResponse.json([]); } // OLD behavior

    // Construct where clause conditionally
    const whereClause = q ? {
        nome: {
            contains: q
        }
    } : {};

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
