import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Connecting to DB...");
        // Use a simple query first
        const userCount = await prisma.user.count();
        console.log(`Users found: ${userCount}`);

        console.log("Querying GamificationProfile...");
        // @ts-ignore
        const profiles = await prisma.gamificationProfile.findMany({
            take: 5,
            include: { user: { select: { username: true } } }
        });

        console.log(`Profiles found: ${profiles.length}`);
        console.log("Sample:", profiles);

        await prisma.$disconnect();
        console.log("DB Verification Successful ✅");
    } catch (e) {
        console.error("DB Verification Failed ❌", e);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();
