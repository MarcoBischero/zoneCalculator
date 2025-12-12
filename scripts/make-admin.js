const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const username = 'MarcoBischero';
    console.log(`Promoting ${username} to Admin (idRuolo: 1)...`);

    await prisma.user.updateMany({
        where: { username: username },
        data: { idRuolo: 1 }
    });

    console.log('User promoted successfully.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
