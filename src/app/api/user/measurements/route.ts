
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation Schema
const MeasurementSchema = z.object({
    userId: z.number().or(z.string().regex(/^\d+$/).transform(Number)),
    weight: z.number().optional(),
    waist: z.number().optional(),
    hips: z.number().optional(),
    chest: z.number().optional(),
    bodyFat: z.number().optional(),
    lbm: z.number().optional(),
});

function jsonError(message: string, status = 400) {
    return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = MeasurementSchema.safeParse(body);

        if (!validation.success) {
            return jsonError("Invalid Data: " + JSON.stringify(validation.error.format()));
        }

        const { userId, ...data } = validation.data;

        // 1. Transaction: Save Log & Award XP
        const result = await prisma.$transaction(async (tx) => {
            // Save Log
            const log = await tx.measurementLog.create({
                data: {
                    userId,
                    ...data
                }
            });

            // Check if award eligible (e.g. max once per week)
            // For MVP: Award always if weight provided? Or check last log date?
            // Let's implement simple rule: if no log in last 6 days, award 50 XP.

            const lastLog = await tx.measurementLog.findFirst({
                where: {
                    userId,
                    id: { not: log.id } // Exclude current
                },
                orderBy: { date: 'desc' }
            });

            let xpEarned = 0;
            let alreadyAwarded = false;

            if (!lastLog || (new Date().getTime() - lastLog.date.getTime()) > (6 * 24 * 60 * 60 * 1000)) {
                // Award XP
                // Call Gamification Logic (reuse specific logic or duplicate simple update here for speed/transaction safety)
                // We will do a direct update here to keep it atomic.

                const profile = await tx.gamificationProfile.findUnique({ where: { userId } });
                if (profile) {
                    const reward = 50;
                    // We need to calc new level. We should import calc logic but for now simple increment is enough.
                    // Ideally we call a shared service.
                    // For MVP: Just add XP. Level calc is done on 'track' or lazy update.
                    // Actually, let's update simple XP.
                    await tx.gamificationProfile.update({
                        where: { userId },
                        data: {
                            lifetimeXp: { increment: reward },
                            lastActionDate: new Date()
                        }
                    });
                    xpEarned = reward;
                }
            } else {
                alreadyAwarded = true;
            }

            return { log, xpEarned, alreadyAwarded };
        });

        return NextResponse.json({ success: true, ...result });

    } catch (e: any) {
        console.error(e);
        return jsonError(e.message, 500);
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) return jsonError("UserId required");

        const history = await prisma.measurementLog.findMany({
            where: { userId: Number(userId) },
            orderBy: { date: 'asc' }, // For charts
            take: 50 // Limit 50 points
        });

        return NextResponse.json(history);
    } catch (e: any) {
        return jsonError(e.message, 500);
    }
}
