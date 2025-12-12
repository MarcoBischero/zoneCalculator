import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const role = Number(token?.role || 0);
        const mode = token?.mode || '0';

        // Onboarding is needed ONLY if:
        // 1. User is authenticated
        // 2. User is a Standard User (Role 0)
        // 3. User has NOT completed onboarding (Mode '0')
        const needsOnboarding = isAuth && role === 0 && mode === '0';
        const isOnboardingPage = req.nextUrl.pathname.startsWith('/onboarding');

        if (isAuth) {
            // If needs onboarding and NOT on onboarding page -> redirect TO onboarding
            if (needsOnboarding && !isOnboardingPage) {
                return NextResponse.redirect(new URL('/onboarding', req.url));
            }
            // If DOES NOT need onboarding (e.g. Admin or Finished) and IS on onboarding page -> redirect AWAY
            // (Unless specifically debugging, but general rule applies)
            if (!needsOnboarding && isOnboardingPage) {
                return NextResponse.redirect(new URL('/', req.url));
            }
        }
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/login",
        },
    }
);

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - login (login page)
         * - api/auth (auth API)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
    ],
};
