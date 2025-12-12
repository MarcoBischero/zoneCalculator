
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

// Role Constants (Assuming for now, editable)
const ROLE_SUPER_ADMIN = 1;
const ROLE_DIETICIAN = 2;
const ROLE_PATIENT = 3;

// GET: List Users
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, id } = session.user as any;
    const roleId = Number(role);
    const userId = Number(id);

    try {
        let users;
        if (roleId === ROLE_SUPER_ADMIN) {
            // Super Admin sees ALL users
            users = await prisma.user.findMany({
                include: { dietician: { select: { username: true } }, ruolo: true },
                orderBy: { id: 'desc' }
            });
        } else if (roleId === ROLE_DIETICIAN) {
            // Dietician sees only THEIR patients
            users = await prisma.user.findMany({
                where: { dieticianId: userId },
                include: { dietician: { select: { username: true } }, ruolo: true },
                orderBy: { id: 'desc' }
            });
        } else {
            return NextResponse.json({ error: "Forbidden: Access denied" }, { status: 403 });
        }

        // Clean user objects (remove password)
        const safeUsers = users.map(u => {
            console.log(`User ${u.id}: idRuolo=${u.idRuolo}, ruolo=`, u.ruolo);
            return {
                id: u.id,
                username: u.username,
                email: u.email,
                role: u.ruolo?.descrizione || `Role ${u.idRuolo || 'Unknown'}`,
                roleId: u.idRuolo,
                dietician: u.dietician?.username || null
            };
        });

        return NextResponse.json(safeUsers);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

// PUT: Update User
export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { role, id: userId } = session.user as any; // Renamed id to userId to avoid conflict with body.id
    const roleId = Number(role);

    const body = await req.json();
    const { id, username, email, role: targetRole, password } = body;

    console.log(`[ADMIN PUT] Update User: ${id} by Requester Role: ${roleId}`);
    console.log(`[ADMIN PUT] Payload targetRole: ${targetRole} (Type: ${typeof targetRole})`);

    try {
        const targetUser = await prisma.user.findUnique({ where: { id: Number(id) } });
        if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Security Check: Dietician can ONLY edit their own patients
        if (roleId === ROLE_DIETICIAN) {
            if (targetUser.dieticianId !== userId) {
                return NextResponse.json({ error: "Forbidden: Not your patient" }, { status: 403 });
            }
            // Dietician cannot change roles (Target must remain Patient)
            // Implicitly enforced by not updating role if Dietician, or better:
            // Let's just ignore 'targetRole' from body if Dietician
        }

        const updateData: any = {
            username,
            email,
        };

        // Only update role if provided AND User is SuperAdmin
        if (targetRole !== undefined && roleId === ROLE_SUPER_ADMIN) {
            updateData.idRuolo = Number(targetRole);
        }

        // Only update password if provided
        if (password && password.length > 0) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await prisma.user.update({
            where: { id: Number(id) },
            data: updateData
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Update User Error:", e);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

// POST: Create User (Fast Add)
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { role, id } = session.user as any;
    const roleId = Number(role);
    const myId = Number(id);

    // Only Admins or Dieticians can create users
    if (roleId !== ROLE_SUPER_ADMIN && roleId !== ROLE_DIETICIAN) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { username, password, email, targetRole } = body;

    // Dieticians can ONLY create Patients (Role 3) and must link to themselves
    // Admins can create anything

    let newRole = ROLE_PATIENT; // Default
    let assignedDietician: number | null = null; // Explicit type

    if (roleId === ROLE_DIETICIAN) {
        newRole = ROLE_PATIENT;
        assignedDietician = myId;
    } else if (roleId === ROLE_SUPER_ADMIN) {
        // Admin specified role
        newRole = Number(targetRole) || ROLE_PATIENT;
    }

    // Generate random password if not provided (default behavior now)
    const autoPassword = password || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const finalPassword = autoPassword;

    try {
        const hashedPassword = await bcrypt.hash(finalPassword, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                email,
                idRuolo: newRole,
                dieticianId: assignedDietician,
                randKey: Math.random().toString(36).substring(7),
                ip: '127.0.0.1',
                ipupdate: '127.0.0.1',
                mode: '0' // Ensure they need onboarding
            }
        });

        // Initialize Gamification Profile
        if (prisma.gamificationProfile) {
            await prisma.gamificationProfile.create({
                data: { userId: newUser.id }
            });
        }

        // MOCK EMAIL SENDING (Password intentionally NOT logged for security)
        console.log("==========================================");
        console.log(`[EMAIL MOCK] To: ${email}`);
        console.log(`Subject: Benvenuto in ZoneCalculator!`);
        console.log(`Ciao ${username}, ecco le tue credenziali:`);
        console.log(`Username: ${username} (o la tua email)`);
        console.log(`Password: [REDACTED - sent via email]`);
        console.log("==========================================");

        return NextResponse.json({ success: true, user: newUser });
    } catch (e) {
        console.error("Create User Error:", e);
        return NextResponse.json({ error: "Failed to create user. Username might be taken." }, { status: 500 });
    }
}
