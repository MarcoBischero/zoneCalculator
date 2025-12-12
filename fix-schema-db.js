const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixSchema() {
    try {
        console.log('Connected to database via Prisma.');

        const queries = [
            // Pasti
            "ALTER TABLE pasti MODIFY dow VARCHAR(2) NULL COMMENT 'Day of Week (0-6)'",
            "ALTER TABLE pasti MODIFY mealType VARCHAR(2) DEFAULT '0' COMMENT 'Meal Type (0-3)'",

            // ProtNeed
            "ALTER TABLE prot_need MODIFY moltiplicatore VARCHAR(5) COMMENT 'Multiplier (1.1-2.3)'",

            // User (risorse)
            "ALTER TABLE risorse MODIFY mode VARCHAR(10) DEFAULT '0'",
            "ALTER TABLE risorse MODIFY cookie VARCHAR(10) DEFAULT '1'"
        ];

        for (const query of queries) {
            console.log(`Executing: ${query}`);
            await prisma.$executeRawUnsafe(query);
            console.log('Success.');
        }

        console.log('All migrations executed successfully.');

    } catch (error) {
        console.error('Error executing schema fix:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixSchema();
