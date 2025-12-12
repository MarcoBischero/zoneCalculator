const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEnums() {
    try {
        // Check using Prisma Model to reproduce error
        console.log('Fetching with prisma.pasto.findFirst()...');
        const mealModel = await prisma.pasto.findFirst({
            take: 1
        });
        console.log('Model result:', mealModel);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkEnums();
