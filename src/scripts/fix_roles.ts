import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting Role Cleanup...')

    // 1. Migrate Users from Role 0 to Role 3 (Paziente)
    // Check if any exist
    const count0 = await prisma.user.count({ where: { idRuolo: 0 } });
    console.log(`Found ${count0} users with Role ID 0 (Legacy Patient). Migrating to Role 3...`);

    if (count0 > 0) {
        const updateResult = await prisma.user.updateMany({
            where: { idRuolo: 0 },
            data: { idRuolo: 3 }
        });
        console.log(`Migrated ${updateResult.count} users.`);
    }

    // 2. Delete Unused Roles 11 (Utente) and 12 (Admin)
    // Ensure no users have these roles first (just in case)
    const count11 = await prisma.user.count({ where: { idRuolo: 11 } });
    const count12 = await prisma.user.count({ where: { idRuolo: 12 } });

    if (count11 > 0 || count12 > 0) {
        console.warn(`WARNING: Found users with Role 11 (${count11}) or 12 (${count12}). NOT deleting roles yet. Please manually review.`);
    } else {
        console.log('No users active in legacy roles (11, 12). Deleting roles...');
        try {
            // Delete explicit IDs
            await prisma.role.deleteMany({
                where: {
                    id: { in: [11, 12] }
                }
            });
            console.log('Roles 11 and 12 deleted successfully.');
        } catch (e) {
            console.error('Error deleting roles:', e);
        }
    }

    // 3. Verify Final State
    const finalRoles = await prisma.role.findMany();
    console.log('Final Roles List:', JSON.stringify(finalRoles, null, 2));
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
