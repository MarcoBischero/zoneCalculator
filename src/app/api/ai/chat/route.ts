import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAIModel } from '@/lib/ai-config';
import { buildUserContext, buildMealContext, buildEducationalPrompt } from '@/lib/context-builder';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { messages } = await req.json();

        if (!session?.user?.email) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get user ID
        const user = await prisma.user.findFirst({
            where: { email: session.user.email }
        });

        if (!user) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Build rich context
        let systemPrompt = "You are ZoneMentor, an expert Zone Diet nutritionist. Be helpful and concise.";

        try {
            const [userContext, mealContext] = await Promise.all([
                buildUserContext(user.id),
                buildMealContext(user.id, 7)
            ]);

            // Check if educational mode is enabled
            const preferences = await prisma.userPreferences.findUnique({
                where: { userId: user.id }
            });

            const enableEducational = preferences?.enableEducationalMode ?? true;

            systemPrompt = buildEducationalPrompt(userContext, mealContext, enableEducational);
        } catch (error) {
            console.error('Error building context:', error);
            // Fallback to basic prompt if context building fails
        }

        const modelName = await getAIModel();
        const model = genAI.getGenerativeModel({ model: modelName });

        // Build conversation with system prompt
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

