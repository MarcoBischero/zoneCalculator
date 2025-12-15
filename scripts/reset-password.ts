import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Delete existing user
    await prisma.user.deleteMany({
        where: {
            OR: [
                { email: 'marco.biscardi@gmail.com' },
                { username: 'marco' }
            ]
        }
    });

    console.log('✅ Deleted old user');

    // Create new user with new password
    const hash = await bcrypt.hash('woTcez-wimmy9-qidxac', 10);

    const user = await prisma.user.create({
        data: {
            username: 'marco',
            email: 'marco.biscardi@gmail.com',
            password: hash,
            idRuolo: 1, // Admin
            nome: 'Marco',
            randKey: Math.random().toString(36),
            ip: '127.0.0.1',
            ipupdate: new Date()
        }
    });

    console.log(`✅ Created user: ${user.username} (ID: ${user.id})`);
    console.log('🔑 Password: woTcez-wimmy9-qidxac');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
