import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { getAIModel } from "@/lib/ai-config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: 5 requests per minute
    const limitCheck = rateLimit(`chef-${session.user.id}`, 5, 60000);
    if (!limitCheck.success) return limitCheck.error;

    try {
        const body = await req.json();
        const { mode, ingredients, blocks, mealTime, preference, manualIngredients } = body;

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
        }

        const modelName = await getAIModel();
        const model = genAI.getGenerativeModel({ model: modelName });

        let prompt = "";

        if (mode === 'fridge') {
            const allIngredients = [...(ingredients || []), ...(manualIngredients || [])].join(', ');
            prompt = `
                Act as a Zone Diet Chef.
                I have these ingredients: ${allIngredients}.
                Create a balanced Zone Diet meal using mainly these ingredients.
                Target Blocks: ${blocks || 3} (approx ${(blocks || 3) * 7}g Protein, ${(blocks || 3) * 9}g Carbs, ${(blocks || 3) * 1.5}g Fat).
                
                If the provided ingredients are not enough to make a balanced Zone meal, you may suggest adding common pantry items (e.g., Olive Oil, Salt, spices, generic protein/carb sources if strictly necessary).

                Return a JSON object with this structure:
                {
                    "title": "Creative Meal Name",
                    "description": "Short description of the meal",
                    "blocks": ${blocks || 3},
                    "ingredients": [
                        { "name": "Ingredient Name", "grams": 100, "macros": { "p": 20, "c": 0, "f": 5 } } // macros per 100g
                    ]
                }
                Calculated grams should result in the target blocks total.
                RETURN JSON ONLY.
            `;
        } else {
            // Zone Mode
            prompt = `
                Act as a Zone Diet Chef.
                Create a perfect ${blocks || 3} Block meal for ${mealTime || 'Lunch'}.
                Dietary Preference: ${preference || 'Any'}.

                Target Blocks: ${blocks || 3} (approx ${(blocks || 3) * 7}g Protein, ${(blocks || 3) * 9}g Carbs, ${(blocks || 3) * 1.5}g Fat).

                Return a JSON object with this structure:
                {
                    "title": "Creative Meal Name",
                    "description": "Short description of the meal",
                    "blocks": ${blocks || 3},
                    "ingredients": [
                        { "name": "Ingredient Name", "grams": 100, "macros": { "p": 20, "c": 0, "f": 5 } } // macros per 100g
                    ]
                }
                Calculated grams should result in the target blocks total.
                RETURN JSON ONLY.
            `;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // JSON Cleanup
        let jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const start = jsonString.indexOf('{');
        const end = jsonString.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            jsonString = jsonString.substring(start, end + 1);
        }

        const data = JSON.parse(jsonString);

        // SMART FEATURE: Auto-balance the meal
        if (data.ingredients && Array.isArray(data.ingredients)) {
            const { autoBalanceMeal } = require('@/lib/zone-logic');
            data.ingredients = autoBalanceMeal(data.ingredients, blocks || 3);
        }

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        logger.error('AI Chef Error', error);
        return NextResponse.json({ error: "Failed to generate recipe" }, { status: 500 });
    }
}
