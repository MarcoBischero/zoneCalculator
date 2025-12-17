const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const mealNames = [
        "Riso con Salmone",
        "PolloHarararirararara",
        "ToastFarri con prosciutto",
        "Fesa & Giuncata",
        "FrenchToast",
        "Sgombro e pomodoro",
        "Crudo e Kiwi",
        "MezzoToast con Fesa"
    ];

    console.log("Searching for meals...");

    const foundMeals = [];
    const missingMeals = [];

    for (const name of mealNames) {
        // Use 'contains' for flexibility, or exact match if preferred. 
        // Using 'contains' might match multiples, so we'll be careful.
        const meals = await prisma.pasto.findMany({
            where: {
                nome: { contains: name }
            },
            select: { codicePasto: true, nome: true, mealType: true }
        });

        if (meals.length > 0) {
            // Pick the first one if multiple, or list them for debug
            foundMeals.push({ search: name, match: meals[0] });
        } else {
            missingMeals.push(name);
        }
    }

    console.log("--- FOUND ---");
    console.log(JSON.stringify(foundMeals, null, 2));

    if (missingMeals.length > 0) {
        console.log("--- MISSING ---");
        console.log(JSON.stringify(missingMeals, null, 2));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
