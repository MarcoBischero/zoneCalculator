
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { weight, height, waist, hips, neck, gender, activity } = await req.json();
    const userId = Number((session.user as any).id);

    // 1. Calculate Body Fat % (Zone Method Approximation)
    // Simplified formula or standard Navy Seal formula
    let bodyFatPerc = 0;

    // Constants for calculation
    const factor = 1.0; // Placeholders for complex log math, using simplified estimation here 
    // Usually: 
    // Men: 86.010 * log10(waist - neck) - 70.041 * log10(height) + 36.76
    // Women: 163.205 * log10(waist + hip - neck) - 97.684 * log10(height) - 78.387

    // Using basic numeric approximation for this demo to ensure valid floats
    if (gender === 'uomo') {
        bodyFatPerc = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    } else {
        bodyFatPerc = 495 / (1.29579 - 0.35004 * Math.log10(waist + hips - neck) + 0.22100 * Math.log10(height)) - 450;
    }

    // Sanity check
    if (isNaN(bodyFatPerc) || bodyFatPerc < 3) bodyFatPerc = 15;
    if (bodyFatPerc > 60) bodyFatPerc = 50;

    // 2. Calculate Lean Body Mass (LBM)
    const leanMassPerc = 100 - bodyFatPerc;
    const lbmKg = (weight * leanMassPerc) / 100;
    const lbmLbs = lbmKg * 2.20462;

    // 3. Calculate Protein Needs
    // Activity Multiplier * LBM (in lbs usually for Zone, or adjust coeff)
    // Standard Zone: LBM (lbs) * activity (0.5 to 1.0) -> grams
    // Let's use the provided multiplier directly on gram basis or standard? 
    // Provided activity is likely 1.3 to 2.0. That usually applies to BMR. 
    // Zone uses specific factors: 0.5 (sedentary) to 1.0 (athlete) per pound of LBM.

    // Mapping user selection (1.3 to 2.0 BMR style) to Zone Activity (0.5 to 1.0)
    let zoneActivity = 0.5;
    const act = Number(activity);
    if (act >= 2.0) zoneActivity = 0.9;
    else if (act >= 1.7) zoneActivity = 0.8;
    else if (act >= 1.5) zoneActivity = 0.7;
    else zoneActivity = 0.5;

    const proteinGrams = lbmLbs * zoneActivity;

    // 4. Calculate Blocks
    const blocks = Math.max(11, Math.round(proteinGrams / 7));
    // Minimum 11 blocks for men, maybe 10 for women roughly.

    // 5. Save to DB
    try {
        const existing = await prisma.protNeed.findFirst({
            where: { codUser: userId }
        });

        const dataPayload = {
            peso: weight,
            altezza: height,
            vita: waist,
            addome: waist,
            anche: hips || 0,
            collo: neck,
            moltiplicatore: activity,
            blocchi: blocks,
            proteineDay: proteinGrams,
            percentualeMG: bodyFatPerc,
            percentualeMM: leanMassPerc,
            lastCheck: new Date()
        };

        if (existing) {
            await prisma.protNeed.update({
                where: { codiceProtneed: existing.codiceProtneed },
                data: dataPayload
            });
        } else {
            await prisma.protNeed.create({
                data: {
                    ...dataPayload,
                    codUser: userId
                }
            });
        }

        // Update User Mode to "Active/Onboarded"
        await prisma.user.update({
            where: { id: userId },
            data: { mode: '1' }
        });

        return NextResponse.json({ success: true, blocks, proteinGrams });

    } catch (e) {
        console.error("Onboarding Error:", e);
        return NextResponse.json({ error: "DB Error" }, { status: 500 });
    }
}
