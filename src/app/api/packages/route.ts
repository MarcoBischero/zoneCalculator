import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // FOOD or MEAL
        const ownerId = searchParams.get('ownerId'); // Filter by owner

        const whereClause: any = {};
        if (type) whereClause.type = type;

        // If ownerId is specified, restrict to it.
        // If not, what? Show all permissible?
        // Logic:
        // - SuperAdmin can see all.
        // - Dietician can see OWN + System.
        // - Patient? Probably shouldn't be calling this list endpoint primarily, but if so, maybe just assigned?
        // Let's implement Dietician/Admin view for now since this is for management.

        const userId = parseInt(session.user.id);
        const userRole = (session.user as any).role; // 1 = Admin, 2 = Dietician, 3 = Patient

        if (ownerId) {
            whereClause.ownerId = parseInt(ownerId);
        } else {
            // Default filter if no owner specified:
            if (userRole === 3) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            // Show System + Own
            whereClause.OR = [
                { isSystem: true },
                { ownerId: userId }
            ];
            // If SuperAdmin, maybe show everything?
            if (userRole === 1) {
                delete whereClause.OR; // Show all
            }
        }

        const packages = await prisma.package.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: { items: true, assignedTo: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(packages);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, description, type } = body;

        if (!name || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Only Dietician (2) or Admin (1) can create
        const userRole = (session.user as any).role;
        if (userRole !== 1 && userRole !== 2) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const newPackage = await prisma.package.create({
            data: {
                name,
                description,
                type: type, // 'FOOD' or 'MEAL'
                ownerId: parseInt(session.user.id),
                isSystem: (userRole === 1 && body.isSystem) ? true : false // Only admin can create system packages
            }
        });

        return NextResponse.json(newPackage);
    } catch (error) {
        console.error("Create Package Error:", error);
        return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
    }
}
