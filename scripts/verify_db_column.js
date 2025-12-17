const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Check if we can select createdAt
    try {
        const user = await prisma.user.findFirst({
            select: { id: true, createdAt: true }
        });
        console.log("User sample:", user);
        console.log("createdAt exists!");
    } catch (e) {
        console.error("Error verifying createdAt:", e.message);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
