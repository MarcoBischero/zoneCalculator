const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);
    const username = args[0] || 'superadmin';
    const password = args[1] || 'SuperAdmin123!';
    const email = 'admin@zonecalculator.pro';

    console.log(`Creating/Updating Super Admin user: ${username}`);
    console.log(`Target Database: ${process.env.DATABASE_URL?.split('@')[1]}`); // Log only host for safety

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
        where: { username: username }
    });

    if (existingUser) {
        console.log(`User ${username} exists (ID: ${existingUser.id}). Promoting to Super Admin (Role 1)...`);
        await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                idRuolo: 1, // Super Admin Role
                password: hashedPassword,
                mode: '1' // Complete onboarding
            }
        });
        console.log("User promoted and password updated.");
    } else {
        console.log("User not found. Creating new Super Admin...");
        await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                email,
                idRuolo: 1, // Super Admin Role
                randKey: 'admin-key',
                ip: '0.0.0.0',
                ipupdate: '0.0.0.0',
                mode: '1',
                language: 'it',
                sesso: 'uomo'
            }
        });
        console.log("Super Admin user created.");
    }
}

main()
    .catch(e => {
        console.error("Error creating admin:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
