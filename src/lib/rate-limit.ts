import { NextResponse } from 'next/server';

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis for distributed rate limiting
 * 
 * @param identifier - Unique identifier (e.g., user ID, IP address)
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns Object with success status and optional error response
 */
export function rateLimit(
    identifier: string,
    limit: number = 10,
    windowMs: number = 60000
): { success: true } | { success: false; error: NextResponse } {
    const now = Date.now();
    const userLimit = rateLimitMap.get(identifier);

    // Clean up expired entries periodically (simple cleanup)
    if (rateLimitMap.size > 10000) {
        for (const [key, value] of rateLimitMap.entries()) {
            if (now > value.resetTime) {
                rateLimitMap.delete(key);
            }
        }
    }

    if (!userLimit || now > userLimit.resetTime) {
        rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
        return { success: true };
    }

    if (userLimit.count >= limit) {
        const retryAfter = Math.ceil((userLimit.resetTime - now) / 1000);
        return {
            success: false,
            error: NextResponse.json(
                {
                    error: 'Too many requests. Please try again later.',
                    retryAfter: retryAfter
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': retryAfter.toString(),
                        'X-RateLimit-Limit': limit.toString(),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': userLimit.resetTime.toString()
                    }
                }
            )
        };
    }

    userLimit.count++;
    return { success: true };
}

/**
 * Get rate limit info for a user without incrementing the counter
 */
export function getRateLimitInfo(identifier: string): {
    limit: number;
    remaining: number;
    reset: number;
} | null {
    const userLimit = rateLimitMap.get(identifier);
    if (!userLimit) return null;

    const now = Date.now();
    if (now > userLimit.resetTime) {
        rateLimitMap.delete(identifier);
        return null;
    }

    return {
        limit: 10, // Default limit, should be parameterized in production
        remaining: Math.max(0, 10 - userLimit.count),
        reset: userLimit.resetTime
    };
}
