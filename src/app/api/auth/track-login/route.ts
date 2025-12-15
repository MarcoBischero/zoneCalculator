import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getClientIp } from "@/lib/ip-utils";

/**
 * POST /api/auth/track-login
 * 
 * Updates user IP addresses and access timestamps after successful login.
 * This endpoint should be called by the client immediately after authentication.
 * 
 * Security:
 * - Requires active authenticated session
 * - Only updates data for the authenticated user (no user ID in body to prevent tampering)
 * - IP extracted server-side from request headers
 */
export async function POST(request: Request) {
    // 1. Verify Authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const userId = Number(session.user.id);

    if (!userId || isNaN(userId)) {
        return NextResponse.json(
            { error: "Invalid user session" },
            { status: 400 }
        );
    }

    try {
        // 2. Extract Client IP
        const clientIp = getClientIp(request);

        // 3. Get current user data to preserve previous values
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                ip: true,
                ipupdate: true,
                lastaccess: true,
                lastaccessupdate: true
            }
        });

        if (!currentUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // 4. Calculate timestamps (Unix timestamp in seconds)
        const now = Math.floor(Date.now() / 1000);

        // 5. Update user record
        // Logic:
        // - ip: keep the first IP if empty, otherwise keep previous ipupdate
        // - ipupdate: always update to current IP
        // - lastaccess: previous lastaccessupdate (or keep if first access)
        // - lastaccessupdate: current timestamp
        await prisma.user.update({
            where: { id: userId },
            data: {
                ip: currentUser.ip && currentUser.ip.trim() !== ''
                    ? currentUser.ip
                    : clientIp,
                ipupdate: clientIp,
                lastaccess: currentUser.lastaccessupdate || currentUser.lastaccess || now,
                lastaccessupdate: now
            }
        });

        return NextResponse.json({
            success: true,
            message: "Login tracked successfully"
        });

    } catch (error) {
        console.error("[track-login] Error updating user access data:", error);
        return NextResponse.json(
            { error: "Failed to track login" },
            { status: 500 }
        );
    }
}
