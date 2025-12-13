const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting Verification ---');

    // 1. Clean up old test data
    console.log('Cleaning up old test data...');
    // await prisma.package.deleteMany({ where: { name: { startsWith: 'VERIFY_TEST' } } });

    // 2. Create Owner (Dietician)
    console.log('Creating Test Dietician...');
    let dietician = await prisma.user.findFirst({ where: { email: 'test_dietician@verify.com' } });
    if (!dietician) {
        dietician = await prisma.user.create({
            data: {
                email: 'test_dietician@verify.com',
                username: 'TestDietician',
                idRuolo: 2, // Dietician
                password: 'password',
                randKey: 'xyz',
                sesso: 'uomo',
                ip: '127.0.0.1',
                ipupdate: '127.0.0.1'
            }
        });
    }

    // 3. Create Patient
    console.log('Creating Test Patient...');
    let patient = await prisma.user.findFirst({ where: { email: 'test_patient@verify.com' } });
    if (!patient) {
        patient = await prisma.user.create({
            data: {
                email: 'test_patient@verify.com',
                username: 'TestPatient',
                idRuolo: 3, // Patient
                dieticianId: dietician.id,
                password: 'password',
                randKey: 'abc',
                sesso: 'donna',
                ip: '127.0.0.1',
                ipupdate: '127.0.0.1'
            }
        });
    }

    // 4. Create Package
    console.log('Creating Package...');
    const pkg = await prisma.package.create({
        data: {
            name: 'VERIFY_TEST_PKG',
            type: 'MEAL',
            ownerId: dietician.id,
            description: 'Test Package'
        }
    });
    console.log(`Package created: ${pkg.id}`);

    // 5. Add Items to Package
    // First create a meal
    const meal = await prisma.pasto.create({
        data: {
            nome: 'VERIFY_MEAL',
            blocks: 3,
            codUser: dietician.id,
            description: 'Test Meal'
        }
    });

    console.log('Adding item to package...');
    await prisma.packageItem.create({
        data: {
            packageId: pkg.id,
            mealId: meal.codicePasto
        }
    });

    // 6. Assign to Patient
    console.log('Assigning to Patient...');
    await prisma.userPackage.create({
        data: {
            userId: patient.id,
            packageId: pkg.id,
            assignedBy: dietician.id
        }
    });

    // 7. Verify Assignment
    const assigned = await prisma.userPackage.findFirst({
        where: { userId: patient.id, packageId: pkg.id },
        include: { package: { include: { items: true } } }
    });

    if (assigned && assigned.package.name === 'VERIFY_TEST_PKG' && assigned.package.items.length > 0) {
        console.log('✅ SUCCESS: Package assigned correctly and contains items.');
    } else {
        console.error('❌ FAILURE: Assignment or Items mismatch.');
        process.exit(1);
    }

    // 8. Test "Get Meals" Logic (Simulating the query used in API)
    console.log('Testing Meal Access Logic...');
    const assignedPackages = await prisma.userPackage.findMany({
        where: { userId: patient.id },
        include: { package: true }
    });
    const assignedMealPackageIds = assignedPackages
        .filter((up: any) => up.package.type === 'MEAL')
        .map((up: any) => up.package.id);

    console.log('Assigned Meal Package IDs:', assignedMealPackageIds);

    const visibleMeals = await prisma.pasto.findMany({
        where: {
            OR: [
                { codUser: patient.id }, // Own meals
                {
                    packageItems: {
                        some: {
                            packageId: { in: assignedMealPackageIds }
                        }
                    }
                }
            ]
        }
    });

    const foundMeal = visibleMeals.find((m: any) => m.nome === 'VERIFY_MEAL');
    if (foundMeal) {
        console.log('✅ SUCCESS: Patient can see the package meal.');
    } else {
        console.error('❌ FAILURE: Patient cannot see the package meal.');
        process.exit(1);
    }

    console.log('--- Verification Complete ---');

    // Cleanup
    await prisma.pasto.delete({ where: { codicePasto: meal.codicePasto } });
    await prisma.package.delete({ where: { id: pkg.id } });
    await prisma.user.delete({ where: { id: patient.id } });
    await prisma.user.delete({ where: { id: dietician.id } });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
