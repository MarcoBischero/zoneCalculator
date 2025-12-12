const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Fetching first meal...');
    const meal = await prisma.pasto.findFirst({
        include: {
            alimenti: {
                include: {
                    alimento: true
                }
            }
        }
    });

    if (meal) {
        console.log('Found meal ID:', meal.codicePasto);
        console.log('Structure:', JSON.stringify(meal, null, 2));
    } else {
        console.log('No meals found.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
