const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Riso con Salmone (106), PolloHarararirararara (53), ToastFarri (80), Fesa & Giuncata (102)
    // FrenchToast (92), Sgombro (49), Crudo e Kiwi (65), MezzoToast (104)
    const starterMealIds = [106, 53, 80, 102, 92, 49, 65, 104];

    console.log("1. Marking meals as shared...");
    await prisma.pasto.updateMany({
        where: { codicePasto: { in: starterMealIds } },
        data: { isShared: true }
    });

    console.log("2. Creating/Finding Starter Package...");
    const packageName = "Starter Kit";

    // Upsert Package
    let starterPkg = await prisma.package.findFirst({
        where: { name: packageName, isSystemPackage: true }
    });

    if (!starterPkg) {
        starterPkg = await prisma.package.create({
            data: {
                name: packageName,
                description: "Il kit essenziale per iniziare la Zona: 8 pasti bilanciati (2 per tipo).",
                type: 'MEAL',
                isSystemPackage: true
            }
        });
        console.log(`Created new package: ${starterPkg.name} (ID: ${starterPkg.id})`);
    } else {
        console.log(`Found existing package: ${starterPkg.name} (ID: ${starterPkg.id})`);
    }

    console.log("3. Adding items to package...");
    // Clear existing items to be safe/idempotent
    await prisma.packageItem.deleteMany({
        where: { packageId: starterPkg.id }
    });

    // Add new items
    const itemsData = starterMealIds.map(id => ({
        packageId: starterPkg.id,
        mealId: id
    }));

    await prisma.packageItem.createMany({
        data: itemsData
    });

    console.log(`Successfully added ${itemsData.length} meals to Starter Kit.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
