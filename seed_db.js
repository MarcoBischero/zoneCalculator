const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const foods = [
    // PROTEINS (codTipo: 1)
    { nome: 'Chicken Breast (Petto di pollo)', proteine: 23, carboidrati: 0, grassi: 1, codTipo: 1, codFonte: 1 },
    { nome: 'Egg White (Albume)', proteine: 11, carboidrati: 0, grassi: 0, codTipo: 1, codFonte: 2 },
    { nome: 'Salmon (Salmone)', proteine: 20, carboidrati: 0, grassi: 13, codTipo: 1, codFonte: 3 },
    { nome: 'Greek Yogurt 0% (Yogurt Greco)', proteine: 10, carboidrati: 4, grassi: 0, codTipo: 1, codFonte: 1 },
    { nome: 'Tuna canned (Tonno al naturale)', proteine: 25, carboidrati: 0, grassi: 1, codTipo: 1, codFonte: 1 },
    { nome: 'Low Fat Cottage Cheese (Fiocchi di latte)', proteine: 13, carboidrati: 3, grassi: 4, codTipo: 1, codFonte: 1 },
    { nome: 'Turkey Breast (Fesa di tacchino)', proteine: 24, carboidrati: 0, grassi: 1, codTipo: 1, codFonte: 1 },

    // CARBOHYDRATES (codTipo: 2)
    { nome: 'Oatmeal (Avena)', proteine: 13, carboidrati: 68, grassi: 7, codTipo: 2, codFonte: 4 },
    { nome: 'Apple (Mela)', proteine: 0, carboidrati: 14, grassi: 0, codTipo: 2, codFonte: 5 },
    { nome: 'Spinach (Spinaci)', proteine: 3, carboidrati: 3.6, grassi: 0, codTipo: 2, codFonte: 6 },
    { nome: 'Broccoli', proteine: 3, carboidrati: 7, grassi: 0, codTipo: 2, codFonte: 6 },
    { nome: 'Blueberries (Mirtilli)', proteine: 1, carboidrati: 14, grassi: 0, codTipo: 2, codFonte: 5 },
    { nome: 'Kiwi', proteine: 1, carboidrati: 15, grassi: 0.5, codTipo: 2, codFonte: 5 },
    { nome: 'Pear (Pera)', proteine: 0.4, carboidrati: 15, grassi: 0.1, codTipo: 2, codFonte: 5 },

    // FATS (codTipo: 3)
    { nome: 'Almonds (Mandorle)', proteine: 21, carboidrati: 22, grassi: 50, codTipo: 3, codFonte: 7 },
    { nome: 'Olive Oil (Olio Extravergine)', proteine: 0, carboidrati: 0, grassi: 100, codTipo: 3, codFonte: 8 },
    { nome: 'Avocado', proteine: 2, carboidrati: 9, grassi: 15, codTipo: 3, codFonte: 9 },
    { nome: 'Walnuts (Noci)', proteine: 15, carboidrati: 14, grassi: 65, codTipo: 3, codFonte: 7 },
    { nome: 'Macadamia Nuts', proteine: 8, carboidrati: 14, grassi: 76, codTipo: 3, codFonte: 7 }
];

async function main() {
    console.log('Seeding database...');

    // Check if foods exist
    const count = await prisma.alimento.count();
    if (count > 0) {
        console.log(`Database already contains ${count} foods. Skipping seed.`);
        return;
    }

    for (const food of foods) {
        await prisma.alimento.create({
            data: {
                nome: food.nome,
                proteine: food.proteine,
                carboidrati: food.carboidrati,
                grassi: food.grassi,
                codTipo: food.codTipo,
                codFonte: food.codFonte
            }
        });
    }
    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
