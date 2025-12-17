const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const result = {};

    // Find Dinners
    const dinners = await prisma.pasto.findMany({
        where: { mealType: 2 },
        take: 5
    });
    console.log("Dinners:", JSON.stringify(dinners, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
