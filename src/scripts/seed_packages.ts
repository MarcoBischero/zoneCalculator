import { PrismaClient, PackageType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Base Packages...');

    // 1. Create Base Food Package (System)
    const baseFoodPackage = await prisma.package.upsert({
        where: { id: 1 }, // Assuming ID 1 is reserved or verify by name
        update: {},
        create: {
            name: 'Base Foods',
            description: 'Standard System Foods',
            type: 'FOOD', // Use string if enum not exported correctly, but usually it is
            isSystemPackage: true,
            ownerId: 1 // Assign to Super Admin (ID 1 usually)
        }
    });

    console.log('Base Food Package:', baseFoodPackage);

    // 2. Add ALL existing foods to this package
    // Fetch all food IDs
    const allFoods = await prisma.alimento.findMany({ select: { codiceAlimento: true } });

    if (allFoods.length > 0) {
        console.log(`Adding ${allFoods.length} foods to Base Package...`);

        // Batch insert package items
        // Prisma createMany is efficient
        const packageItems = allFoods.map(f => ({
            packageId: baseFoodPackage.id,
            foodId: f.codiceAlimento
        }));

        // We might have duplicates if we run this multiple times, so delete old ones first for this package
        await prisma.packageItem.deleteMany({
            where: { packageId: baseFoodPackage.id }
        });

        await prisma.packageItem.createMany({
            data: packageItems
        });
        console.log('Foods added.');
    }

    // 3. Create Base Meal Package (Empty for now, or select some system meals)
    const baseMealPackage = await prisma.package.upsert({
        where: { id: 2 },
        update: {},
        create: {
            name: 'Base Meals',
            description: 'Standard System Meals',
            type: 'MEAL',
            isSystemPackage: true,
            ownerId: 1
        }
    });
    console.log('Base Meal Package created:', baseMealPackage);

    // 4. Assign Base Packages to ALL existing users (Transition Strategy)
    //   const allUsers = await prisma.user.findMany({ select: { id: true } });
    //   const userPackages = [];
    //   for (const user of allUsers) {
    //       userPackages.push({ userId: user.id, packageId: baseFoodPackage.id });
    //       userPackages.push({ userId: user.id, packageId: baseMealPackage.id });
    //   }

    //   // Insert assignments (skip duplicates logic complex with createMany, so maybe just iterate or ignore)
    //   // For now, let's NOT assign automatically. The user said "I can enable them". 
    //   // But to avoid "Empty Screen" panic, maybe we should assign to at least the current logged in user (Admin)?
    //   // Let's assume the Verified Manual Step will handle assignment.

    console.log('Seeding complete.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
