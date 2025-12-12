
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const tipi = await prisma.tipo.findMany();
        const fonti = await prisma.fonte.findMany();
        console.log('TIPI:', JSON.stringify(tipi, null, 2));
        console.log('FONTI:', JSON.stringify(fonti, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
