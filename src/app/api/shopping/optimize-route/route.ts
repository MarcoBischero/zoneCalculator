import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAIModel } from '@/lib/ai-config';
import { getSupermarketById } from '@/lib/supermarket-layouts';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { items, supermarketId } = await request.json();

        if (!items || !supermarketId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const supermarket = getSupermarketById(supermarketId);
        if (!supermarket) {
            return NextResponse.json(
                { error: 'Invalid supermarket ID' },
                { status: 400 }
            );
        }

        // Prepare prompt for AI
        const itemsList = items.map((item: any) =>
            `${item.name} (${Math.round(item.grams)}g)`
        ).join(', ');

        const sectionsInfo = supermarket.sections
            .map(s => `${s.order}. ${s.icon} ${s.name} - keywords: ${s.keywords.slice(0, 5).join(', ')}`)
            .join('\n');

        const prompt = `You are a smart shopping assistant. 
Given this list of food ingredients and a supermarket layout, organize the ingredients by section in the optimal walking order through the store.

SUPERMARKET: ${supermarket.name}
SECTIONS (in walking order):
${sectionsInfo}

INGREDIENTS TO ORGANIZE:
${itemsList}

RULES:
1. Match each ingredient to the most appropriate section based on the keywords
2. If an ingredient could fit multiple sections, choose the most logical one
3. If no keywords match, use the "Altro" or last section
4. Preserve the original ingredient names exactly as given
5. Return ONLY a valid JSON response, no explanation

REQUIRED JSON FORMAT:
{
  "sections": [
    {
      "name": "Section Name",
      "icon": "emoji",
      "order": 1,
      "items": [{"name": "ingredient name", "grams": 100}]
    }
  ]
}

Return the organized shopping list:`;

        const modelName = await getAIModel();
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean and parse JSON
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const organized = JSON.parse(cleanedText);

        // Ensure all items are accounted for
        const organizedItemNames = new Set(
            organized.sections.flatMap((s: any) =>
                s.items.map((i: any) => i.name.toLowerCase())
            )
        );

        // Find any missing items and add to "Altro" section
        const missingItems = items.filter((item: any) =>
            !organizedItemNames.has(item.name.toLowerCase())
        );

        if (missingItems.length > 0) {
            let altroSection = organized.sections.find((s: any) =>
                s.name.toLowerCase().includes('altro') ||
                s.name.toLowerCase().includes('varie')
            );

            if (!altroSection) {
                altroSection = {
                    name: 'Altro',
                    icon: '🛒',
                    order: 999,
                    items: []
                };
                organized.sections.push(altroSection);
            }

            altroSection.items.push(...missingItems.map((item: any) => ({
                name: item.name,
                grams: item.grams
            })));
        }

        // Sort sections by order
        organized.sections.sort((a: any, b: any) => a.order - b.order);

        // Remove empty sections
        organized.sections = organized.sections.filter((s: any) => s.items && s.items.length > 0);

        return NextResponse.json({
            success: true,
            supermarket: supermarket.name,
            organized: organized.sections
        });

    } catch (error: any) {
        console.error('Shopping optimization error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to optimize shopping list' },
            { status: 500 }
        );
    }
}
