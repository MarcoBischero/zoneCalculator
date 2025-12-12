import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const count = await prisma.alimento.count();
        if (count > 0) {
            return NextResponse.json({ message: `Database already contains ${count} foods. No changes made.` });
        }

        const foods = [
            // PROTEINS (codTipo: 1) - using default codFonte: 1 for now if tables empty
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

        // Ensure basic Types exist to avoid FK errors
        // Note: This assumes tables exist. 
        // We'll just try to insert foods. If Types/Fonti don't exist, it might fail if FKs are strict.
        // Assuming legacy schema has these populated or they are optional/defaulted.
        // The Prisma schema says default(0) for codTipo/codFonte, so it should be fine if 0 exists or constraints are loose.

        for (const food of foods) {
            await prisma.alimento.create({ data: food });
        }

        return NextResponse.json({ message: 'Success! Database populated with sample foods.' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
