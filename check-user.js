const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    const username = 'MarcoBischero';
    console.log(`Checking for user: ${username}`);

    // Select ONLY fields we know are safe to avoid schema mismatch on 'mode'
    const user = await prisma.user.findFirst({
        where: { username: username },
        select: {
            id: true,
            username: true,
            password: true,
            email: true
        }
    });

    if (user) {
        console.log('User found:', user);

        // Hash new password 'password'
        // Cost factor 10
        const newHash = await bcrypt.hash('password', 10);
        console.log('Setting new password hash:', newHash);

        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: { password: newHash },
            select: { id: true } // Return only ID to avoid schema error on read-back
        });

        console.log('Password reset successfully to "password"');
    } else {
        console.log('User NOT found!');

        // Create the user if missing
        console.log('Creating user...');
        const newHash = await bcrypt.hash('password', 10);

        // We have to be careful creating if schema is wrong, but let's try strict creation
        // Assuming defaults hold. 
        // If 'mode' is required and mismatches, this might fail.
        // But let's hope 'mode' has a default or is nullable.
        // Schema says: mode String? @default("0")

        try {
            await prisma.user.create({
                data: {
                    username: 'MarcoBischero',
                    password: newHash,
                    email: 'marco@example.com',
                    randKey: 'random',
                    ip: '127.0.0.1',
                    ipupdate: '127.0.0.1'
                },
                select: { id: true }
            });
            console.log('User created successfully!');
        } catch (e) {
            console.error('Failed to create:', e);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
