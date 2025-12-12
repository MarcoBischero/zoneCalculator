import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        const roles = await prisma.role.findMany()
        console.log('ROLES:', JSON.stringify(roles, null, 2))

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                idRuolo: true,
                dieticianId: true
            }
        })
        console.log('USERS:', JSON.stringify(users, null, 2))
    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
