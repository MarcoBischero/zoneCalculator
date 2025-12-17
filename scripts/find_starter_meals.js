const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const mealTypes = [0, 1, 2, 3]; // Breakfast, Lunch, Dinner, Snack
    const result = {};

    for (const type of mealTypes) {
        const meals = await prisma.pasto.findMany({
            where: {
                mealType: type,
                isShared: true // Assuming 'shared' meals are the system/base ones
            },
            take: 2,
            select: { codicePasto: true, nome: true, mealType: true }
        });
        result[type] = meals;
    }

    console.log(JSON.stringify(result, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
