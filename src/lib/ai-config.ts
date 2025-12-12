import { prisma } from "@/lib/prisma";

export const DEFAULT_AI_MODEL = "gemini-1.5-flash";

export async function getAIModel(): Promise<string> {
    try {
        const option = await prisma.opzione.findFirst({
            where: { opzione: "ai_model" }
        });
        return option?.valore || DEFAULT_AI_MODEL;
    } catch (error) {
        console.error("Failed to fetch AI model from DB, using default", error);
        return DEFAULT_AI_MODEL;
    }
}
