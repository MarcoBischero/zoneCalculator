
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiMealGenerationSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { getAIModel } from '@/lib/ai-config';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Rate limiting: 10 AI meal generations per 5 minutes
        const limitCheck = rateLimit(session.user.id, 10, 300000);
        if (!limitCheck.success) return limitCheck.error;

        const body = await request.json();

        // SECURITY: Validate inputs
        const validation = aiMealGenerationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                error: "Invalid input",
                details: validation.error.errors
            }, { status: 400 });
        }

        const { name, type, blocks, preference } = validation.data;

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Server Configuration Error: Missing API Key" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const modelName = await getAIModel();
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `
            Act as a Zone Diet Expert Chef.
            Create a balanced Zone Diet meal recipe.
            
            Meal Name: "${name}"
            Meal Type: ${type} (e.g., Breakfast, Lunch, Snack)
            Target Size: ${blocks} Blocks
            Dietary Preference: ${preference || "None"}

            ZONE DIET RULES:
            - 1 Block Protein = 7g Protein
            - 1 Block Carbs = 9g Carbs
            - 1 Block Fat = 1.5g Fat (assuming lean protein sources, or 3g if pure fat source)
            
            Task:
            1. Select ingredients that fit the meal name and type.
            2. Calculate the exact grams for each ingredient to match the target blocks perfectly.
            3. Ensure the total macros sum up correctly (Protein: ${blocks * 7}g, Carbs: ${blocks * 9}g, Fat: ${blocks * 1.5}g).
            
            Return ONLY a JSON array of ingredients in this format:
            [
                { 
                    "name": "Chicken Breast", 
                    "grams": 120, 
                    "macros": { "p": 23, "c": 0, "f": 1 } // Macros per 100g of this specific food
                },
                ...
            ]

            IMPORTANT: 
            - "macros" must be values PER 100g. 
            - "grams" is the amount to eat.
            - Do not include explanations. JSON ONLY.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Robust JSON extraction
        let jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const firstBracket = jsonString.indexOf('[');
        const lastBracket = jsonString.lastIndexOf(']');

        if (firstBracket !== -1 && lastBracket !== -1) {
            jsonString = jsonString.substring(firstBracket, lastBracket + 1);
        }

        const ingredients = JSON.parse(jsonString);

        return NextResponse.json({ success: true, ingredients });

    } catch (error: any) {
        logger.error('AI Meal Gen Error', error);
        return NextResponse.json({ error: error.message || "Failed to generate meal" }, { status: 500 });
    }
}
