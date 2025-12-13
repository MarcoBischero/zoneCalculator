// Script to import data to Cloud SQL, preserving production passwords
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Cloud SQL connection (via Cloud SQL proxy or socket)
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'mysql://zonecalc_user:ZoneCalcUserPass123!@localhost/zonecalculator?socket=/cloudsql/gen-lang-client-0322370238:europe-west1:zone-calc-db'
        }
    }
});

const PRODUCTION_USERS_TO_PRESERVE = ['superadmin', 'MarcoBischero'];

async function importDatabase(exportDir: string) {
    console.log('🚀 Starting database import to Cloud SQL...');
    console.log(`📁 Import directory: ${exportDir}`);

    try {
        // 0. Preserve production passwords
        console.log('🔐 Preserving production passwords...');
        const productionPasswords: Record<string, string> = {};

        for (const username of PRODUCTION_USERS_TO_PRESERVE) {
            const user = await prisma.user.findFirst({
                where: { username },
                select: { password: true }
            });

            if (user && user.password) {
                productionPasswords[username] = user.password;
                console.log(`✅ Preserved password for ${username}`);
            }
        }

        // 1. Clear existing data using TRUNCATE (bypasses FK constraints)
        console.log('\n🧹 Clearing existing data with TRUNCATE...');

        // Disable FK checks and use TRUNCATE with correct table names from schema @@map
        await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`;

        //Using actual MySQL table names from schema.prisma @@map directives
        await prisma.$executeRawUnsafe('TRUNCATE TABLE `user_packages`');
        console.log('✅ Cleared user package assignments');

        await prisma.$executeRawUnsafe('TRUNCATE TABLE `package_items`');
        console.log('✅ Cleared package items');

        await prisma.$executeRawUnsafe('TRUNCATE TABLE `packages`');
        console.log('✅ Cleared packages');

        await prisma.$executeRawUnsafe('TRUNCATE TABLE `pasti_alimenti`');
        console.log('✅ Cleared meal ingredients');

        await prisma.$executeRawUnsafe('TRUNCATE TABLE `calendar_items`');
        console.log('✅ Cleared calendar items');

        await prisma.$executeRawUnsafe('TRUNCATE TABLE `pasti`');
        console.log('✅ Cleared meals');

        await prisma.$executeRawUnsafe('TRUNCATE TABLE `alimenti`');
        console.log('✅ Cleared foods');

        await prisma.$executeRawUnsafe('TRUNCATE TABLE `prot_need`');
        console.log('✅ Cleared protein needs');

        await prisma.$executeRawUnsafe('TRUNCATE TABLE `risorse`');
        console.log('✅ Cleared users');

        await prisma.$executeRawUnsafe('TRUNCATE TABLE `ruoli`');
        console.log('✅ Cleared roles');

        await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`;
        console.log('✅ Foreign key checks re-enabled');

        // 2. Import Roles
        console.log('\n📊 Importing roles...');
        const roles = JSON.parse(fs.readFileSync(path.join(exportDir, 'roles.json'), 'utf-8'));
        for (const role of roles) {
            await prisma.role.create({ data: role });
        }
        console.log(`✅ Imported ${roles.length} roles`);

        // 3. Import Users (with password preservation)
        console.log('👥 Importing users...');
        const users = JSON.parse(fs.readFileSync(path.join(exportDir, 'users.json'), 'utf-8'));

        for (const user of users) {
            // Remove relations that were included in export
            const { ruolo, ...userData } = user;

            // Preserve production passwords
            if (PRODUCTION_USERS_TO_PRESERVE.includes(userData.username) && productionPasswords[userData.username]) {
                userData.password = productionPasswords[userData.username];
                console.log(`🔐 Restored production password for ${userData.username}`);
            }

            await prisma.user.create({ data: userData });
        }
        console.log(`✅ Imported ${users.length} users`);

        // 4. Import Foods
        console.log('🍎 Importing foods...');
        const foods = JSON.parse(fs.readFileSync(path.join(exportDir, 'foods.json'), 'utf-8'));

        for (const food of foods) {
            await prisma.alimento.create({ data: food });
        }
        console.log(`✅ Imported ${foods.length} foods`);

        // 5. Import Packages
        console.log('📦 Importing packages...');
        const packages = JSON.parse(fs.readFileSync(path.join(exportDir, 'packages.json'), 'utf-8'));

        for (const pkg of packages) {
            // Remove count fields
            const { _count, ...packageData } = pkg;
            await prisma.package.create({ data: packageData });
        }
        console.log(`✅ Imported ${packages.length} packages`);

        // 6. Import Package Items
        console.log('📋 Importing package items...');
        const packageItems = JSON.parse(fs.readFileSync(path.join(exportDir, 'package_items.json'), 'utf-8'));

        for (const item of packageItems) {
            await prisma.packageItem.create({ data: item });
        }
        console.log(`✅ Imported ${packageItems.length} package items`);

        // 7. Import User Package Assignments
        console.log('🔗 Importing user package assignments...');
        const userPackages = JSON.parse(fs.readFileSync(path.join(exportDir, 'user_packages.json'), 'utf-8'));

        for (const userPkg of userPackages) {
            await prisma.userPackage.create({ data: userPkg });
        }
        console.log(`✅ Imported ${userPackages.length} user package assignments`);

        // 8. Import Meals
        console.log('🍽️  Importing meals...');
        const meals = JSON.parse(fs.readFileSync(path.join(exportDir, 'meals.json'), 'utf-8'));

        for (const meal of meals) {
            // Remove all relation fields that were exported
            const { alimenti, user, packageItems, calendarItems, ...mealData } = meal;
            await prisma.pasto.create({ data: mealData });
        }
        console.log(`✅ Imported ${meals.length} meals`);

        // 9. Import Meal Ingredients
        console.log('📝 Importing meal ingredients...');
        const mealIngredients = JSON.parse(fs.readFileSync(path.join(exportDir, 'meal_ingredients.json'), 'utf-8'));

        for (const ingredient of mealIngredients) {
            await prisma.pastoAlimento.create({ data: ingredient });
        }
        console.log(`✅ Imported ${mealIngredients.length} meal ingredients`);

        // 10. Import Calendar Items (if exists)
        const calendarItemsPath = path.join(exportDir, 'calendar_items.json');
        if (fs.existsSync(calendarItemsPath)) {
            console.log('📅 Importing calendar items...');
            const calendarItems = JSON.parse(fs.readFileSync(calendarItemsPath, 'utf-8'));

            for (const item of calendarItems) {
                await prisma.calendarItem.create({ data: item });
            }
            console.log(`✅ Imported ${calendarItems.length} calendar items`);
        }

        // 11. Verify import
        console.log('\n✅ Verifying import...');
        const verificationStats = {
            roles: await prisma.role.count(),
            users: await prisma.user.count(),
            foods: await prisma.alimento.count(),
            packages: await prisma.package.count(),
            packageItems: await prisma.packageItem.count(),
            userPackages: await prisma.userPackage.count(),
            meals: await prisma.pasto.count(),
            mealIngredients: await prisma.pastoAlimento.count()
        };

        console.log('\n📊 Import Verification:');
        console.log(JSON.stringify(verificationStats, null, 2));

        console.log('\n✨ Import completed successfully!');
        console.log('🔐 Production passwords preserved for:', PRODUCTION_USERS_TO_PRESERVE.join(', '));

    } catch (error) {
        console.error('❌ Import failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Get export directory from args or use latest
const exportDir = process.argv[2] || '/tmp/db-export-2025-12-13T15-40-23-108Z';

if (!fs.existsSync(exportDir)) {
    console.error(`❌ Export directory not found: ${exportDir}`);
    console.error('Usage: npx tsx scripts/import-to-cloud.ts [export-directory]');
    process.exit(1);
}

// Run import
importDatabase(exportDir)
    .then(() => {
        console.log('\n🎉 All done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
