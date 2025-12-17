import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('--- LOCAL DB INSPECTION ---');

        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                password: true,
                idRuolo: true,
                dieticianId: true,
                mode: true,
                nome: true,
                cognome: true
            }
        });
        console.log('ALL USERS:', JSON.stringify(users, null, 2));

        const roles = await prisma.role.findMany();
        console.log('ROLES:', JSON.stringify(roles, null, 2));

    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
