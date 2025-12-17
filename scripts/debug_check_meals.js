const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.pasto.count();
    console.log(`Total meals: ${count}`);

    const meals = await prisma.pasto.findMany({
        take: 10,
        select: { codicePasto: true, nome: true, mealType: true, isShared: true, codUser: true }
    });
    console.log(JSON.stringify(meals, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
