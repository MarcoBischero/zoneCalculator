import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers, cookies } from "next/headers";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    const headersList = await headers();
    const cookiesList = await cookies();

    const allCookies = cookiesList.getAll().map(c => ({ name: c.name, value: c.value.substring(0, 10) + '...' }));

    return NextResponse.json({
        status: "Debug Info",
        session: session,
        env: {
            NODE_ENV: process.env.NODE_ENV,
            NEXTAUTH_URL: process.env.NEXTAUTH_URL,
            AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
            HAS_SECRET: !!process.env.NEXTAUTH_SECRET,
            SECRET_LEN: process.env.NEXTAUTH_SECRET?.length
        },
        cookies: allCookies,
        headers: {
            host: headersList.get('host'),
            x_forwarded_proto: headersList.get('x-forwarded-proto'),
            x_forwarded_host: headersList.get('x-forwarded-host')
        }
    });
}
