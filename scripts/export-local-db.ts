// Script to export local database to JSON, excluding test meals
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'mysql://mycam2:Aqlt709_!0@192.168.1.15:3306/zoneCalculator'
        }
    }
});

const TEST_MEALS_TO_EXCLUDE = [
    'Pranzo3',
    'Salmon con Spinach',
    'Cod Fillet w Apple',
    'Riso e verdure2',
    'ColazioneNoemi'
];

async function exportDatabase() {
    console.log('🚀 Starting database export from local DB...');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportDir = `/tmp/db-export-${timestamp}`;

    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
    }

    console.log(`📁 Export directory: ${exportDir}`);

    try {
        //1. Roles
        console.log('📊 Exporting roles...');
        const roles = await prisma.role.findMany();
        fs.writeFileSync(path.join(exportDir, 'roles.json'), JSON.stringify(roles, null, 2));
        console.log(`✅ Exported ${roles.length} roles`);

        // 2. Users
        console.log('👥 Exporting users...');
        const users = await prisma.user.findMany({ include: { ruolo: true } });
        fs.writeFileSync(path.join(exportDir, 'users.json'), JSON.stringify(users, null, 2));
        console.log(`✅ Exported ${users.length} users`);

        // 3. Foods
        console.log('🍎 Exporting foods...');
        const foods = await prisma.alimento.findMany();
        fs.writeFileSync(path.join(exportDir, 'foods.json'), JSON.stringify(foods, null, 2));
        console.log(`✅ Exported ${foods.length} foods`);

        // 4. Packages
        console.log('📦 Exporting packages...');
        const packages = await prisma.package.findMany({ include: { _count: { select: { items: true, assignedTo: true } } } });
        fs.writeFileSync(path.join(exportDir, 'packages.json'), JSON.stringify(packages, null, 2));
        console.log(`✅ Exported ${packages.length} packages`);

        // 5. Package Items
        console.log('📋 Exporting package items...');
        const packageItems = await prisma.packageItem.findMany();
        fs.writeFileSync(path.join(exportDir, 'package_items.json'), JSON.stringify(packageItems, null, 2));
        console.log(`✅ Exported ${packageItems.length} package items`);

        // 6. User Packages
        console.log('🔗 Exporting user package assignments...');
        const userPackages = await prisma.userPackage.findMany();
        fs.writeFileSync(path.join(exportDir, 'user_packages.json'), JSON.stringify(userPackages, null, 2));
        console.log(`✅ Exported ${userPackages.length} user package assignments`);

        // 7. Meals (excluding test meals)
        console.log('🍽️  Exporting meals (excluding test meals)...');
        const meals = await prisma.pasto.findMany({
            where: { nome: { notIn: TEST_MEALS_TO_EXCLUDE } },
            include: { alimenti: true, user: true }
        });
        fs.writeFileSync(path.join(exportDir, 'meals.json'), JSON.stringify(meals, null, 2));
        console.log(`✅ Exported ${meals.length} meals (excluded ${TEST_MEALS_TO_EXCLUDE.length} test meals)`);

        // 8. Meal Ingredients
        console.log('📝 Exporting meal ingredients...');
        const mealIds = meals.map(m => m.codicePasto);
        const mealIngredients = await prisma.pastoAlimento.findMany({ where: { codPasto: { in: mealIds } } });
        fs.writeFileSync(path.join(exportDir, 'meal_ingredients.json'), JSON.stringify(mealIngredients, null, 2));
        console.log(`✅ Exported ${mealIngredients.length} meal ingredients`);

        // 9. Calendar Items
        console.log('📅 Exporting calendar items...');
        const calendarItems = await prisma.calendarItem.findMany();
        fs.writeFileSync(path.join(exportDir, 'calendar_items.json'), JSON.stringify(calendarItems, null, 2));
        console.log(`✅ Exported ${calendarItems.length} calendar items`);

        // 10. Summary
        const summary = {
            exportDate: new Date().toISOString(),
            source: '192.168.1.15:3306/zoneCalculator',
            destination: 'Cloud SQL',
            excludedMeals: TEST_MEALS_TO_EXCLUDE,
            stats: {
                roles: roles.length,
                users: users.length,
                foods: foods.length,
                packages: packages.length,
                packageItems: packageItems.length,
                userPackages: userPackages.length,
                meals: meals.length,
                mealIngredients: mealIngredients.length,
                calendarItems: calendarItems.length
            }
        };

        fs.writeFileSync(path.join(exportDir, 'EXPORT_SUMMARY.json'), JSON.stringify(summary, null, 2));
        console.log('\n📦 Export Summary:');
        console.log(JSON.stringify(summary.stats, null, 2));
        console.log(`\n✨ Export completed successfully!`);
        console.log(`📂 Files saved to: ${exportDir}`);

        return exportDir;

    } catch (error) {
        console.error('❌ Export failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

exportDatabase()
    .then((dir) => {
        console.log(`\n🎉 All done! Export directory: ${dir}`);
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
