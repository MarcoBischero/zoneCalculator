import { GoogleGenerativeAI } from "@google/generative-ai";
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

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
        }

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        // Remove header if present (data:image/jpeg;base64,...)
        const base64Image = image.replace(/^data:image\/\w+;base64,/, "");

        // Use stable Gemini model for vision
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        You are a nutrition expert specializing in the Zone Diet.
        Analyze this image and identify ALL visible food ingredients.
        
        CRITICAL TASK:
        Divide the ingredients into a perfectly balanced Zone Meal of exactly ${blocks} BLOCKS.
        
        RULES:
        1. 1 Block Protein = 7g protein.
        2. 1 Block Carbs = 9g carbs.
        3. 1 Block Fat = 1.5g fat.
        4. The TOTAL Protein Blocks must be approx ${blocks}.
        5. The TOTAL Carb Blocks must be approx ${blocks}.
        6. The TOTAL Fat Blocks must be approx ${blocks}.
        7. DO NOT output excess fat. If ingredients are fatty (like nuts/avocado), reduce their portion to meet the ${blocks} block limit.
        
        OUTPUT FORMAT (JSON ONLY, no markdown):
        [
            {
                "foodName": "Ingredient Name",
                "protein": <protein per 100g>,
                "carbs": <carbs per 100g>,
                "fat": <fat per 100g>,
                "grams": <calculated portion size in grams>,
                "blocks": <calculated blocks contributions>
            }
        ]
        
        Example: If I ask for 3 Blocks, and you see Chicken and Apple.
        - Chicken (23g P/100g) -> Need 21g Protein (3*7). Grams = (21*100)/23 ≈ 91g.
        - Apple (14g C/100g) -> Need 27g Carbs (3*9). Grams = (27*100)/14 ≈ 193g.
        - Olive Oil (100g F/100g) -> Need 4.5g Fat (3*1.5). Grams = 4.5g.
        
        Ensure you list EVERY distinct ingredient you see in the photo.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: "image/jpeg",
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Cleanup json
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(jsonString);

        return NextResponse.json({ success: true, data });

    } catch (error) {
        logger.error('Vision API Error', error);
        return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
    }
}
