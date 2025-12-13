
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAIModel } from '@/lib/ai-config';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const modelName = await getAIModel();
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `Generate a helpful, easy-to-read daily nutrition article about the Zone Diet (Dieta a Zona).
        Target Audience: Everyday users / dieters. NOT scientists.
        Language: Italian (Simple, friendly, motivating).
        Length: Medium (approx 400-600 words).
        
        Structure (JSON):
        {
            "title": "Catchy, lifestyle headline",
            "summary": "Practical tip (max 200 chars) for the dashboard card.",
            "content": "Full article in HTML format. Focus on PRACTICAL ADVICE (what to eat, how to feel better). Explain concepts simply (like explaining to a friend). meaningful content but easy to digest. Use <h2> for clear sections.",
            "author": "Dr. Zone AI",
            "readTime": "3-4 min",
            "imagePrompt": "English keywords for a bright, appetizing food photography or lifestyle image (e.g. happy person eating salad, colorful fruit bowl, fresh healthy meal prep)" 
        }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean JSON
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const article = JSON.parse(cleanedText);

        return NextResponse.json(article);
    } catch (error) {
        console.error("News Generation Error:", error);
        return NextResponse.json({
            title: "Il Potere della Zona",
            summary: "Scopri come la Dieta a Zona riduce l'infiammazione e migliora le tue prestazioni.",
            content: "<h2>L'infiammazione Silente</h2><p>La dieta a Zona non è solo una dieta, è uno stile di vita...</p>",
            author: "System Fallback",
            readTime: "1 min",
            imagePrompt: "healthy balanced food charts"
        });
    }
}
