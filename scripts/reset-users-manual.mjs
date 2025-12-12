
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetPasswords() {
    const targets = ['MarcoBiscardi', 'NoemiBischero'];
    const newPassword = 'Zone2025!';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    for (const username of targets) {
        try {
            const user = await prisma.user.findFirst({
                where: { username: username }
            });

            if (!user) {
                console.log(`❌ User ${username} not found.`);
                continue;
            }

            await prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            });
            console.log(`✅ Password reset for ${username} (ID: ${user.id})`);
        } catch (e) {
            console.log(`❌ Could not update ${username}. Error: ${e.message}`);
        }
    }
}

resetPasswords()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
