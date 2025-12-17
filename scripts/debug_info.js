const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Find Base Foods
    const baseFoods = await prisma.package.findFirst({
        where: { type: 'FOOD', isSystemPackage: true }
    });
    console.log("Base Foods Package:", baseFoods);

    // Find Roles
    const roles = await prisma.role.findMany();
    console.log("Roles:", roles);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
