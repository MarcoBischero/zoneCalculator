import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
    try {
        const { username, email, password, role } = await req.json();

        if (!username || !email || !password) {
            return NextResponse.json({ error: 'Tutti i campi sono obbligatori' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Username o Email già in uso' }, { status: 409 });
        }

        // Determine Role ID (2 = Dietician, 3 = Patient)
        // Default to Patient (3) if invalid or unspecified
        const roleId = role === 'dietician' ? 2 : 3;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                idRuolo: roleId,
                mode: '0',
                language: 'it',
                randKey: Math.random().toString(36).substring(7),
                ip: '0.0.0.0', // Placeholder
                ipupdate: '0.0.0.0'
            }
        });

        // --- PACKAGE ASSIGNMENT LOGIC ---
        // 1. Base Foods (ID: 1) - Everyone gets this
        // 2. Starter Kit (ID: 3) - Everyone gets this initially

        try {
            await prisma.userPackage.createMany({
                data: [
                    { userId: newUser.id, packageId: 1 }, // Base Foods
                    { userId: newUser.id, packageId: 3 }  // Starter Kit
                ],
                skipDuplicates: true
            });
        } catch (pkgError) {
            console.error("Error assigning packages:", pkgError);
            // Non-blocking, but good to know
        }

        return NextResponse.json({
            message: 'Utente registrato con successo',
            userId: newUser.id
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
    }
}
