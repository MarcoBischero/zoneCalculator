import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET items in a package
export async function GET(request: Request, context: any) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const params = await context.params;
    const packageId = parseInt(params.id);
    const userId = parseInt(session.user.id);
    const userRole = (session.user as any).role;

    // Verify package existence and access
    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });

    // Access: Owner OR Admin OR (maybe Dietician can spy? No, only allow owner/admin to manage)
    if (pkg.ownerId !== userId && userRole !== 1) {
        // If it's a system package, only Admin can manage content
        if (pkg.isSystemPackage && userRole !== 1) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        // If generic restriction
        if (!pkg.isSystemPackage && pkg.ownerId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const items = await prisma.packageItem.findMany({
        where: { packageId },
        include: {
            alimento: true,
            pasto: true
        }
    });

    return NextResponse.json(items);
}

// ADD Item
export async function POST(request: Request, context: any) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const params = await context.params;
    const packageId = parseInt(params.id);
    const userId = parseInt(session.user.id);
    const userRole = (session.user as any).role;

    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });

    if (pkg.ownerId !== userId && userRole !== 1) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { foodId, mealId } = body;

        if (!foodId && !mealId) return NextResponse.json({ error: 'Missing item id' }, { status: 400 });

        // Check if type matches package type
        if (pkg.type === 'FOOD' && !foodId) return NextResponse.json({ error: 'Package is FOOD type' }, { status: 400 });
        if (pkg.type === 'MEAL' && !mealId) return NextResponse.json({ error: 'Package is MEAL type' }, { status: 400 });

        const item = await prisma.packageItem.create({
            data: {
                packageId,
                foodId: foodId ? parseInt(foodId) : null,
                mealId: mealId ? parseInt(mealId) : null
            }
        });

        return NextResponse.json(item);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
    }
}

// REMOVE Item
export async function DELETE(request: Request, context: any) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const params = await context.params;
    const packageId = parseInt(params.id); // This is from URL /api/packages/[id]/items?itemId=X

    // Actually, DELETE usually takes ID of the resource to delete. 
    // Here resource is "item in package". 
    // Let's pass itemId in query string for simplicity or body. Query string is standard for DELETE.
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });

    const userId = parseInt(session.user.id);
    const userRole = (session.user as any).role;

    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });

    if (pkg.ownerId !== userId && userRole !== 1) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        // Verify item belongs to package
        const item = await prisma.packageItem.findFirst({
            where: {
                id: parseInt(itemId),
                packageId: packageId
            }
        });

        if (!item) return NextResponse.json({ error: 'Item not found in package' }, { status: 404 });

        await prisma.packageItem.delete({
            where: { id: parseInt(itemId) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }
}
