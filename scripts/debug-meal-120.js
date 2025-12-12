const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Fetching meal 120...');
    const meal = await prisma.pasto.findUnique({
        where: { codicePasto: 120 },
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
        console.log('Name:', meal.nome);
        console.log('Ingredients Count:', meal.alimenti.length);
        console.log('Ingredients:', JSON.stringify(meal.alimenti, null, 2));
    } else {
        console.log('No meal found with ID 120.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
