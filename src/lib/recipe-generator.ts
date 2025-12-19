import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { getAIModel } from "@/lib/ai-config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateRecipeContent(mealId: number, mealName: string, ingredientsList: string, language: string = 'it') {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.error("API Key missing");
            return null;
        }

        // 1. Generate Procedure via Gemini
        const modelName = await getAIModel();
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = `Act as a professional chef. Create a detailed step-by-step cooking procedure for a meal named "${mealName}" containing strictly these ingredients: ${ingredientsList}.
        The procedure must be in ${language === 'it' ? 'Italian' : 'English'}.
        Formatting: Just the numbered steps. No intro/outro.
        Rules:
        - Mention weighing ingredients if relevant for Zone Diet accuracy.
        - Keep it simple and healthy (grilled, steamed, raw) suitable for Zone Diet.`;

        const result = await model.generateContent(prompt);
        const procedure = result.response.text();

        // 2. Generate Image (Pollinations.ai)
        const imagePrompt = `professional food photography of ${mealName}, ${ingredientsList}, high res, studio lighting, 4k`;
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

        return { procedure, imgUrl };
    } catch (error) {
        console.error("Recipe Gen Error:", error);
        return null;
    }
}
