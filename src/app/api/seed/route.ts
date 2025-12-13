import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function GET() {
    try {
        console.log("Starting production seed process...");

        // 1. Run DB Push (Schema Sync)
        try {
            console.log("Running 'npx prisma db push'...");
            const { stdout, stderr } = await execAsync('npx prisma db push --accept-data-loss');
            console.log("DB Push Output:", stdout);
            if (stderr) console.error("DB Push Error:", stderr);
        } catch (e: any) {
            console.error("Failed to run db push:", e);
            // Continue? If schema is missing, next steps fail, but might work if table exists.
            return NextResponse.json({ error: "Failed to sync schema", details: e.message }, { status: 500 });
        }

        const messages = [];

        // 2. Ensure Super Admin Users
        const admins = [
            { username: 'MarcoBischero', email: 'marco@example.com', pass: 'password' }, // Or ZoneCalcUserPass123!
            { username: 'superadmin', email: 'admin@zonecalculator.pro', pass: 'SuperAdmin123!' }
        ];

        for (const admin of admins) {
            const existing = await prisma.user.findFirst({ where: { username: admin.username } });
            const hash = await bcrypt.hash(admin.pass, 10);

            if (existing) {
                await prisma.user.update({
                    where: { id: existing.id },
                    data: { idRuolo: 1, password: hash, mode: '1' }
                });
                messages.push(`Updated ${admin.username} to Super Admin (Role 1). Pass: ${admin.pass}`);
            } else {
                await prisma.user.create({
                    data: {
                        username: admin.username,
                        password: hash,
                        email: admin.email,
                        idRuolo: 1,
                        randKey: 'admin',
                        ip: '0.0.0.0',
                        ipupdate: '0.0.0.0',
                        mode: '1',
                        language: 'it',
                        sesso: 'uomo'
                    }
                });
                messages.push(`Created ${admin.username} as Super Admin (Role 1). Pass: ${admin.pass}`);
            }
        }

        // 3. Seed Foods (Original Logic)
        const count = await prisma.alimento.count();
        if (count > 0) {
            messages.push(`Database already contains ${count} foods. Skipping food seed.`);
        } else {
            const foods = [
                // PROTEINS (codTipo: 1)
                { nome: 'Chicken Breast (Petto di pollo)', proteine: 23, carboidrati: 0, grassi: 1, codTipo: 1, codFonte: 1 },
                { nome: 'Egg White (Albume)', proteine: 11, carboidrati: 0, grassi: 0, codTipo: 1, codFonte: 2 },
                { nome: 'Salmon (Salmone)', proteine: 20, carboidrati: 0, grassi: 13, codTipo: 1, codFonte: 3 },
                { nome: 'Greek Yogurt 0% (Yogurt Greco)', proteine: 10, carboidrati: 4, grassi: 0, codTipo: 1, codFonte: 1 },
                { nome: 'Tuna canned (Tonno al naturale)', proteine: 25, carboidrati: 0, grassi: 1, codTipo: 1, codFonte: 1 },

                // CARBOHYDRATES (codTipo: 2)
                { nome: 'Oatmeal (Avena)', proteine: 13, carboidrati: 68, grassi: 7, codTipo: 2, codFonte: 4 },
                { nome: 'Apple (Mela)', proteine: 0, carboidrati: 14, grassi: 0, codTipo: 2, codFonte: 5 },
                { nome: 'Spinach (Spinaci)', proteine: 3, carboidrati: 3.6, grassi: 0, codTipo: 2, codFonte: 6 },
                { nome: 'Broccoli', proteine: 3, carboidrati: 7, grassi: 0, codTipo: 2, codFonte: 6 },

                // FATS (codTipo: 3)
                { nome: 'Almonds (Mandorle)', proteine: 21, carboidrati: 22, grassi: 50, codTipo: 3, codFonte: 7 },
                { nome: 'Olive Oil (Olio Extravergine)', proteine: 0, carboidrati: 0, grassi: 100, codTipo: 3, codFonte: 8 },
                { nome: 'Avocado', proteine: 2, carboidrati: 9, grassi: 15, codTipo: 3, codFonte: 9 },
                { nome: 'Walnuts (Noci)', proteine: 15, carboidrati: 14, grassi: 65, codTipo: 3, codFonte: 7 }
            ];

            for (const food of foods) {
                await prisma.alimento.create({ data: food });
            }
            messages.push(`Seeded ${foods.length} base foods.`);
        }

        return NextResponse.json({ success: true, log: messages });
    } catch (error: any) {
        console.error("Seed Error:", error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
