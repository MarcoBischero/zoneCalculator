
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'superadmin@zonecalc.com';
    // Use bcrypt to match the primary auth strategy in lib/auth.ts
    const password = await bcrypt.hash('SuperZone2025!', 10);

    console.log(`Checking for existing superadmin: ${email}`);

    const existing = await prisma.user.findFirst({
        where: { email }
    });

    if (existing) {
        console.log('Superadmin already exists. Updating role to 1 (Admin)...');
        await prisma.user.update({
            where: { id: existing.id },
            data: {
                idRuolo: 1, // 1 = Admin based on admin/users/page.tsx logic
                username: 'SUPERADMIN',
                password: password
            }
        });
    } else {
        console.log('Creating new Superadmin...');
        await prisma.user.create({
            data: {
                email,
                username: 'SUPERADMIN',
                password, // MD5 hashed
                idRuolo: 1, // Admin (Superadmin)
                nome: 'Super',
                cognome: 'Admin',
                randKey: 'superkey',
                ip: '127.0.0.1',
                ipupdate: '127.0.0.1'
            }
        });
    }

    console.log('Superadmin setup complete.');
    console.log('Login: superadmin@zonecalc.com');
    console.log('Pass: SuperZone2025!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
