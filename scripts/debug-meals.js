
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Fetching last 5 meals...');
    const meals = await prisma.pasto.findMany({
        take: 5,
        orderBy: { codicePasto: 'desc' },
        include: {
            alimenti: {
                include: {
                    alimento: true
                }
            }
        }
    });

    console.log(JSON.stringify(meals, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
