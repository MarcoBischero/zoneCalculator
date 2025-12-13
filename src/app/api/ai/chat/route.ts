import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { messages } = await req.json();

        let userContext = "User is a guest.";
        let mealsContext = "No meal data available.";

        if (session?.user?.email) {
            const user = await prisma.user.findFirst({
                where: { email: session.user.email },
                include: {
                    protNeeds: {
                        orderBy: { lastCheck: 'desc' },
                        take: 1
                    }
                }
            });

            if (user) {
                const profile = user.protNeeds?.[0];

                if (profile) {
                    userContext = `User: ${user.nome || 'User'}, Blocks: ${profile.blocchi}, Weight: ${profile.peso}kg`;
                }

                const recentMeals = await prisma.pasto.findMany({
                    where: { codUser: user.id },
                    orderBy: { codicePasto: 'desc' },
                    take: 5,
                    include: { alimenti: { include: { alimento: true } } }
                });

                mealsContext = "Recent Meals:\n" + recentMeals.map(m =>
                    `- ${m.nome} (${m.blocks} blocks)`
                ).join('\n');
            }
        }

        const systemPrompt = `You are "ZoneMentor", an expert Zone Diet nutritionist.
${userContext}
${mealsContext}

Be motivating, precise, and concise. Use emojis 🐿️`;

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const fullPrompt = `${systemPrompt}\n\n${messages.map((m: any) => `${m.role}: ${m.content}`).join('\n')}\nassistant:`;

        const result = await model.generateContentStream(fullPrompt);

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    controller.enqueue(encoder.encode(text));
                }
                controller.close();
            }
        });

        return new Response(readable, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });

    } catch (error) {
        console.error('Error in chat route:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
