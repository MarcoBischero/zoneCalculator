import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. Define Public Paths (allow access without token)
    if (
        pathname.startsWith('/login') ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/api/seed') ||
        pathname.startsWith('/api/debug-auth') || // Allow Debug Endpoint!
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    // 2. Read Token (The Critical Fix)
    // Cloud Run terminates SSL, so internal traffic is HTTP.
    // By default, getToken expects non-secure cookies on HTTP.
    // We FORCE it to look for the Secure cookie because the Browser sent one.
    const token = await getToken({
        req,
        secureCookie: process.env.NODE_ENV === "production"
    });

    const isAuth = !!token;

    // 3. Protect Routes
    if (!isAuth) {
        // Redirect unauthenticated users to Login
        const url = new URL('/login', req.url);
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
    }

    // 4. Onboarding Logic (Legacy from proxy.ts)
    const role = Number(token?.role || 0);
    const mode = token?.mode || '0';
    const needsOnboarding = role === 0 && mode === '0';
    const isOnboardingPage = pathname.startsWith('/onboarding');

    if (needsOnboarding && !isOnboardingPage) {
        return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    if (!needsOnboarding && isOnboardingPage) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
}

export const config = {
    // Apply to all routes except static assets
    matcher: ["/((?!_next/static|_next/image).*)"],
};
