import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { getAIModel } from '@/lib/ai-config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { mealId, language = 'it' } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "API Key missing" }, { status: 500 });
        }

        const meal = await prisma.pasto.findUnique({
            where: { codicePasto: mealId },
            include: {
                alimenti: {
                    include: { alimento: true }
                }
            }
        });

        if (!meal) return NextResponse.json({ error: "Meal not found" }, { status: 404 });

        // 1. Generate Procedure via Gemini
        const modelName = await getAIModel();
        const model = genAI.getGenerativeModel({ model: modelName });
        const ingredientsList = meal.alimenti.map((a: any) => `${a.grAlimento}g ${a.alimento.nome}`).join(", ");

        const prompt = `Act as a professional chef. Create a detailed step-by-step cooking procedure for a meal named "${meal.nome}" containing strictly these ingredients: ${ingredientsList}.
        The procedure must be in ${language === 'it' ? 'Italian' : 'English'}.
        Formatting: Just the numbered steps. No intro/outro.
        Rules:
        - Mention weighing ingredients if relevant for Zone Diet accuracy.
        - Keep it simple and healthy (grilled, steamed, raw) suitable for Zone Diet.`;

        const result = await model.generateContent(prompt);
        const procedure = result.response.text();

        // 2. Generate Image (Using Pollinations.ai for free generation as placeholder/demo)
        // User requested: "l'immagine deve essere generata con AI (e chiaramente deve rispecchiare il piatto)"
        // Since we don't have DALL-E key, Pollinations is a reliable free alternative suitable for demos.
        // Prompt for image:
        const imagePrompt = `professional food photography of ${meal.nome}, ${ingredientsList}, high res, studio lighting, 4k`;
        const encodedPrompt = encodeURIComponent(imagePrompt);
        const imgUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true`;

        // Save to DB
        await prisma.pasto.update({
            where: { codicePasto: mealId },
            data: {
                description: procedure,
                imgUrl: imgUrl
            }
        });

        return NextResponse.json({ success: true, procedure, imgUrl });

    } catch (error: any) {
        console.error("AI Gen Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate content" }, { status: 500 });
    }
}
