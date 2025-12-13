import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Initialize Gemini
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

                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
