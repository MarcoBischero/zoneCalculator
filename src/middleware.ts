import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // Custom middleware logic if needed
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

// Apply middleware ONLY to protected routes
export const config = {
    matcher: [
        "/dashboard/:path*",
        "/calculator/:path*",
        "/meals/:path*",
        "/settings/:path*",
        "/admin/:path*",
        "/coach/:path*",
        "/foods/:path*",
        "/recipe/:path*",
        "/shopping-list/:path*",
        // Add other protected routes here
    ]
};
