
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const sourceUsername = 'MarcoBischero';
    const targetUsername = 'Superadmin';

    console.log(`Starting migration from ${sourceUsername} to ${targetUsername}...`);

    const sourceUser = await prisma.user.findFirst({ where: { username: sourceUsername } });
    const targetUser = await prisma.user.findFirst({ where: { username: targetUsername } });

    if (!sourceUser || !targetUser) {
        console.error('One or both users not found!');
        process.exit(1);
    }

    console.log(`Source ID: ${sourceUser.id}, Target ID: ${targetUser.id}`);

    // 1. Migrate Meals (Pasti)
    const meals = await prisma.pasto.updateMany({
        where: { codUser: sourceUser.id },
        data: { codUser: targetUser.id }
    });
    console.log(`Migrated ${meals.count} meals.`);

    // 2. Migrate Calendar Items
    const calendar = await prisma.calendarItem.updateMany({
        where: { idUser: sourceUser.id },
        data: { idUser: targetUser.id }
    });
    console.log(`Migrated ${calendar.count} calendar items.`);

    // 3. Migrate ProtNeeds (Weight History)
    const needs = await prisma.protNeed.updateMany({
        where: { codUser: sourceUser.id },
        data: { codUser: targetUser.id }
    });
    console.log(`Migrated ${needs.count} measurement records.`);

    // 4. Migrate Gamification Profile
    // First, delete target's existing profile if it exists to avoid unique constraint error on update
    const targetProfile = await prisma.gamificationProfile.findUnique({ where: { userId: targetUser.id } });
    if (targetProfile) {
        await prisma.gamificationProfile.delete({ where: { userId: targetUser.id } });
        console.log('Deleted existing target gamification profile.');
    }

    // Then update source profile to point to target
    try {
        const sourceProfile = await prisma.gamificationProfile.findUnique({ where: { userId: sourceUser.id } });
        if (sourceProfile) {
            await prisma.gamificationProfile.update({
                where: { userId: sourceUser.id },
                data: { userId: targetUser.id }
            });
            console.log('Migrated gamification profile (points/level).');
        } else {
            console.log('No source gamification profile found.');
        }
    } catch (e) {
        console.error('Error migrating gamification profile:', e);
    }

    console.log('Migration complete!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
