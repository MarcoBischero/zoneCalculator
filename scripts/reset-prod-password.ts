import { PrismaClient } from '@prisma/client';

// Use Cloud SQL Proxy on localhost:3307
const connectionString = 'mysql://zonecalc_user:ZoneCalcUserPass123!@127.0.0.1:3307/zonecalculator';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: connectionString
        }
    }
});

const newPasswordHash = '$2b$10$ogbIUaJ0JYvcMl9CFkcSXukBLeYsn9cchdR7pt49jlivSITYw3Xte';

async function main() {
    try {
        console.log('📡 Connecting to Cloud SQL...');

        // List all users
        const users = await prisma.user.findMany({
            take: 10,
            select: { id: true, username: true, email: true, idRuolo: true }
        });

        console.log(`\n👥 Found ${users.length} users:`);
        users.forEach(u => console.log(`  - ${u.username} (${u.email}) - Role: ${u.idRuolo}`));

        // Find Marco's user
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: 'marco.biscardi@gmail.com' },
                    { username: 'marco' },
                    { email: { contains: 'marco' } }
                ]
            }
        });

        if (user) {
            console.log(`\n✅ Found user: ${user.username} (ID: ${user.id})`);
            await prisma.user.update({
                where: { id: user.id },
                data: { password: newPasswordHash }
            });
            console.log('✅ Password updated!');
        } else {
            console.log('\n❌ User not found. Creating...');
            const newUser = await prisma.user.create({
                data: {
                    username: 'marco',
                    email: 'marco.biscardi@gmail.com',
                    password: newPasswordHash,
                    idRuolo: 1,
                    nome: 'Marco'
                }
            });
            console.log(`✅ User created! ID: ${newUser.id}`);
        }

        console.log('\n🔑 Password: woTcez-wimmy9-qidxac');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
