import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // Assuming this is where prisma client is exported

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 1) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const option = await prisma.opzione.findFirst({
            where: { opzione: "ai_model" }
        });

        return NextResponse.json({
            ai_model: option?.valore || "gemini-2.0-flash"
        });
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 1) { // Type assertion for role
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { ai_model } = body;

        if (!ai_model) {
            return NextResponse.json({ error: "Missing ai_model" }, { status: 400 });
        }

        // Upsert the setting
        // Since Opzione doesn't have a unique constraint on 'opzione' string in schema (it has id PK), 
        // we should carefully check if it exists first to avoid duplicates if the schema isn't strict.
        // best practice with this schema is findFirst then update or create.

        const existing = await prisma.opzione.findFirst({
            where: { opzione: "ai_model" }
        });

        if (existing) {
            await prisma.opzione.update({
                where: { id: existing.id },
                data: { valore: ai_model }
            });
        } else {
            await prisma.opzione.create({
                data: {
                    opzione: "ai_model",
                    valore: ai_model
                }
            });
        }

        return NextResponse.json({ success: true, ai_model });
    } catch (error) {
        console.error("Error saving settings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
