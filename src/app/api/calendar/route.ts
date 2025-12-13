import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { getAIModel } from '@/lib/ai-config';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findFirst({
            where: { email: session.user.email }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const calendarItems = await prisma.calendarItem.findMany({
            where: {
                idUser: user.id
            },
            include: {
                pasto: {
                    include: {
                        alimenti: {
                            include: {
                                alimento: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                order: 'asc'
            }
        });

        return NextResponse.json(calendarItems);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch calendar' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, day, type, mealId, column } = body;

    const userId = parseInt(session.user.id);

    try {
        if (action === 'generate') {
            // Rate limiting: 3 AI generations per 5 minutes
            const limitCheck = rateLimit(`calendar-gen-${userId}`, 3, 300000);
            if (!limitCheck.success) return limitCheck.error;

            // clear existing
            await prisma.calendarItem.deleteMany({ where: { idUser: userId } });

            // fetch all user meals
            const meals = await prisma.pasto.findMany({ where: { codUser: userId } });

            if (meals.length < 3) {
                return NextResponse.json({ error: "Non hai abbastanza pasti salvati per generare un piano. Creane almeno 3!" }, { status: 400 });
            }

            // Security: Sanitize inputs to prevent Prompt Injection
            const sanitize = (str: string) => str.replace(/[{}\[\]:;"]/g, '').replace(/\n/g, ' ').substring(0, 50);

            const mealListInfo = meals.map((m: any) => `- ID: ${m.codicePasto}, Name: ${sanitize(m.nome || 'unnamed')}, Blocks: ${m.blocks}, Type: ${m.mealType || 'Generic'}`).join('\n');
            console.log(`Generating plan with ${meals.length} meals`);

            if (!process.env.GEMINI_API_KEY) {
                console.error("GEMINI_API_KEY is missing in environment variables");
                return NextResponse.json({ error: "Server Configuration Error: Missing API Key" }, { status: 500 });
            }

            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const modelName = await getAIModel();
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `
            Act as a Zone Diet Nutritionist.
            I have a list of saved meals:
            ${mealListInfo}

            Create a 7-day meal plan (Monday to Sunday).
            For each day, assign 5 meals: Breakfast, Lunch, Dinner, Snack 1, Snack 2.
            
            Rules:
            1. Use ONLY the meals provided in the list. Do not hallucinate.
            2. Vary the meals to properly rotate protein sources.
            3. Try to hit approx 11-13 blocks per day if possible with the combinations.
            4. Return a JSON array of objects.
            
            Output JSON Format:
            [
              { "day": 0, "type": 0, "mealId": <ID from provided list> }, // Monday Breakfast
              { "day": 0, "type": 1, "mealId": <ID from provided list> }, // Monday Lunch
              ...
              { "day": 6, "type": 4, "mealId": <ID from provided list> }  // Sunday Snack 2
            ]
            
            Day Indices: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
            Type Indices: 0=Breakfast, 1=Lunch, 2=Dinner, 3=Snack 1, 4=Snack 2

            RETURN JSON ONLY.
            `;

            console.log("Sending prompt to Gemini...");
            const result = await model.generateContent(prompt);
            console.log("Gemini response received");
            const response = await result.response;
            const text = response.text();

            console.log("Gemini Calendar Response Preview:", text.substring(0, 500)); // Debug log

            // Robust JSON extraction
            let jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const firstBracket = jsonString.indexOf('[');
            const lastBracket = jsonString.lastIndexOf(']');

            if (firstBracket !== -1 && lastBracket !== -1) {
                jsonString = jsonString.substring(firstBracket, lastBracket + 1);
            }

            let plan;
            try {
                plan = JSON.parse(jsonString);
            } catch (parseError) {
                console.error("JSON Parse Error. Raw text:", text);
                return NextResponse.json({ error: "Failed to parse AI response", raw: text }, { status: 500 });
            }

            if (!Array.isArray(plan)) {
                return NextResponse.json({ error: "AI returned invalid format (not an array)" }, { status: 500 });
            }

            const newItems = plan.map((item: any) => ({
                idUser: userId,
                column: item.day,
                order: item.type,
                codPasto: item.mealId
            }));

            // Bulk create
            await prisma.calendarItem.createMany({ data: newItems });
            return NextResponse.json({ success: true });
        }

        if (action === 'add') {
            // Upsert logic: delete existing in slot then create new
            // Slot defined by column (day) and order (type index)
            await prisma.calendarItem.deleteMany({
                where: {
                    idUser: userId,
                    column: day,
                    order: parseInt(type) // Ensure type is passed as index
                }
            });

            const item = await prisma.calendarItem.create({
                data: {
                    idUser: userId,
                    column: day,
                    order: parseInt(type),
                    codPasto: mealId
                }
            });
            return NextResponse.json(item);
        }

        if (action === 'remove') {
            await prisma.calendarItem.deleteMany({
                where: {
                    idUser: userId,
                    column: day,
                    order: parseInt(type)
                }
            });
            return NextResponse.json({ success: true });
        }

        if (action === 'copy_previous') {
            // Fetch current calendar items
            const currentItems = await prisma.calendarItem.findMany({
                where: { idUser: userId },
                select: {
                    column: true,
                    order: true,
                    codPasto: true
                }
            });

            // If no items exist, return error
            if (currentItems.length === 0) {
                return NextResponse.json({
                    success: false,
                    message: "No meals in current week to copy"
                }, { status: 400 });
            }

            // Create a duplicate of current items (this simulates "saving as template")
            // In a real implementation with week history, this would copy from previous week
            // For now, we just keep the same data (no-op) or we could clear and re-add

            // Option: Clear and re-create (simulates a "refresh")
            await prisma.calendarItem.deleteMany({ where: { idUser: userId } });

            const newItems = currentItems.map(item => ({
                idUser: userId,
                column: item.column,
                order: item.order,
                codPasto: item.codPasto
            }));

            await prisma.calendarItem.createMany({ data: newItems });

            return NextResponse.json({
                success: true,
                message: "Week template restored"
            });
        }

        if (action === 'clear_week') {
            await prisma.calendarItem.deleteMany({
                where: { idUser: userId }
            });
            return NextResponse.json({ success: true, message: "Week cleared" });
        }

    } catch (e: any) {
        logger.error('Calendar API Error', e);
        // SECURITY: Don't expose stack traces in production
        const isDev = process.env.NODE_ENV === 'development';
        return NextResponse.json({
            error: e.message || 'Server error',
            ...(isDev && { stack: e.stack })
        }, { status: 500 });
    }
}
