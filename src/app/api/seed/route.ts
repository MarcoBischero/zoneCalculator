import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function GET() {
    try {
        console.log("Starting production seed process...");

        // 1. Run DB Push (Schema Sync)
        try {
            console.log("Running 'npx prisma db push'...");
            const { stdout, stderr } = await execAsync('./node_modules/.bin/prisma db push --accept-data-loss');
            console.log("DB Push Output:", stdout);
            if (stderr) console.error("DB Push Error:", stderr);
        } catch (e: any) {
            console.error("Failed to run db push:", e);
        }

        const messages = [];

        // 2. Ensure Users
        const usersToSeed = [
            { username: 'superadmin', email: 'admin@zonecalculator.pro', pass: 'SuperAdmin123!', role: 1, mode: '1' },
            { username: 'MarcoBischero', email: 'marco.biscardi@gmail.com', pass: 'ZoneCalcUserPass123!', role: 1, mode: '1' },
            { username: 'NoemiBischero', email: 'noemi@zonecalculator.pro', pass: 'UserPass123!', role: 0, mode: '0' },
            { username: 'MarcoBiscardi', email: 'marco@zonecalculator.pro', pass: 'UserPass123!', role: 0, mode: '0' }
        ];

        for (const u of usersToSeed) {
            const existing = await prisma.user.findFirst({ where: { username: u.username } });
            const hash = await bcrypt.hash(u.pass, 10);

            if (existing) {
                await prisma.user.update({
                    where: { id: existing.id },
                    data: {
                        idRuolo: u.role,
                        email: u.email, // Ensure email is correct
                        password: hash, // Reset password to known value
                        mode: u.mode
                    }
                });
                messages.push(`Updated ${u.username} (Role ${u.role}).`);
            } else {
                await prisma.user.create({
                    data: {
                        username: u.username,
                        password: hash,
                        email: u.email,
                        idRuolo: u.role,
                        mode: u.mode,
                        randKey: 'seed',
                        ip: '0.0.0.0',
                        ipupdate: '0.0.0.0',
                        language: 'it',
                        sesso: 'uomo'
                    }
                });
                messages.push(`Created ${u.username} (Role ${u.role}).`);
            }
        }

        // 3. Ensure System Packages
        // Package 1: Base Foods
        const pkgFoods = await prisma.package.upsert({
            where: { id: 1 },
            update: { name: 'Base Foods', isSystemPackage: true, type: 'FOOD' },
            create: { id: 1, name: 'Base Foods', description: 'Standard System Foods', type: 'FOOD', isSystemPackage: true, ownerId: 1 }
        });
        messages.push(`Package 'Base Foods' verified.`);

        // Package 2: Base Meals
        const pkgMeals = await prisma.package.upsert({
            where: { id: 2 },
            update: { name: 'Base Meals', isSystemPackage: true, type: 'MEAL' },
            create: { id: 2, name: 'Base Meals', description: 'Standard System Meals', type: 'MEAL', isSystemPackage: true, ownerId: 1 }
        });
        messages.push(`Package 'Base Meals' verified.`);

        // 4. Populate Base Foods Package (if empty)
        const foodCount = await prisma.packageItem.count({ where: { packageId: 1 } });
        if (foodCount === 0) {
            const allFoods = await prisma.alimento.findMany({ select: { codiceAlimento: true } });
            if (allFoods.length > 0) {
                await prisma.packageItem.createMany({
                    data: allFoods.map(f => ({ packageId: 1, foodId: f.codiceAlimento }))
                });
                messages.push(`Added ${allFoods.length} foods to Base Package.`);
            }
        }

        // 5. Assign Packages to Users
        for (const u of usersToSeed) {
            const user = await prisma.user.findFirst({ where: { username: u.username } });
            if (user) {
                // Assign Package 1
                try {
                    await prisma.userPackage.upsert({
                        where: { userId_packageId: { userId: user.id, packageId: 1 } },
                        update: {},
                        create: { userId: user.id, packageId: 1, assignedBy: 1 }
                    });
                } catch (e) { }

                // Assign Package 2
                try {
                    await prisma.userPackage.upsert({
                        where: { userId_packageId: { userId: user.id, packageId: 2 } },
                        update: {},
                        create: { userId: user.id, packageId: 2, assignedBy: 1 }
                    });
                } catch (e) { }
                messages.push(`Assigned packages to ${u.username}.`);
            }
        }

        return NextResponse.json({ success: true, log: messages });
    } catch (error: any) {
        console.error("Seed Error:", error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
