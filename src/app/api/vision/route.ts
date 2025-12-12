import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: 5 requests per minute for Vision API
    const limitCheck = rateLimit(session.user.id, 5, 60000);
    if (!limitCheck.success) return limitCheck.error;

    try {
        const { image, blocks } = await req.json();

        // Security: Prevent Large Payload DoS / Cost Exhaustion
        // Limit 5MB (Base64 string len)
        if (image && image.length > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "Image too large (Max 5MB)" }, { status: 413 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
        }

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        // Extract matches for base64 string
        const matches = image.match(/^data:(image\/\w+);base64,(.+)$/);

        let mimeType = "image/jpeg"; // Default
        let base64Image = image;

        if (matches && matches.length === 3) {
            mimeType = matches[1];
            base64Image = matches[2];
        } else {
            // Fallback cleanup if regex fails
            base64Image = image.replace(/^data:image\/\w+;base64,/, "");
        }

        // Use stable Gemini model for vision
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            // Safety settings to prevent blocking food images
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ]
        });

        // Prompt for the model
        const contextBlocks = blocks ? `The user intends this meal to be approximately ${blocks} Zone Blocks (Total: ${blocks * 7}g Protein, ${blocks * 9}g Carbs, ${blocks * 1.5}g Fat). Use this as a hint for portion sizes.` : "";

        const prompt = `Analyze this image and identify all food items present. 
        ${contextBlocks}
        For each item, estimate the quantity in grams and the macronutrients (protein, carbs, fat) PER 100g. 
        Then calculate the actual grams in the image.
        
        CRITICAL: Return ONLY a raw JSON array. Do not wrap it in an object.
        Schema:
        [
            {
                "foodName": "Item Name",
                "protein": number (total grams in the portion),
                "carbs": number (total grams in the portion),
                "fat": number (total grams in the portion),
                "grams": number (estimated portion size in grams)
            }
        ]
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: mimeType,
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        console.log("Gemini Vision Response:", text);

        // Cleanup json: Find the first '[' and the last ']'
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');

        let jsonString = "";
        if (start !== -1 && end !== -1 && end > start) {
            jsonString = text.substring(start, end + 1);
        } else {
            // Fallback: try standard cleanup if braces not found (unlikely for array)
            jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        }

        let data;
        try {
            data = JSON.parse(jsonString);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError, "Raw Text:", text);
            return NextResponse.json({ error: "Failed to parse AI response", raw: text }, { status: 500 });
        }

        // Robustness: if customized to return { items: [] } or similar, unwrap it
        if (!Array.isArray(data) && data.items && Array.isArray(data.items)) {
            data = data.items;
        } else if (!Array.isArray(data) && data.foods && Array.isArray(data.foods)) {
            data = data.foods;
        }

        if (!Array.isArray(data)) {
            throw new Error("Invalid API response format: Not an array");
        }

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        logger.error('Vision API Error', error);
        return NextResponse.json({
            error: "Failed to analyze image",
            details: error.message || String(error)
        }, { status: 500 });
    }
}
