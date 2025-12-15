import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // Login attempt (credentials not logged for security)
                if (!credentials?.username || !credentials?.password) {
                    // Missing credentials
                    return null;
                }

                const user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { username: credentials.username },
                            { email: credentials.username }
                        ]
                    },
                    select: {
                        id: true,
                        username: true,
                        password: true,
                        email: true,
                        idRuolo: true,
                        mode: true
                    }
                });

                if (!user || !user.password) {
                    // User not found or no password
                    return null;
                }

                // User found, verifying password

                // 1. Check if password is already bcrypt (starts with $2b$ or $2a$ or $2y$)
                if (user.password.startsWith('$2')) {
                    // Verifying bcrypt hash
                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    if (isValid) {
                        return {
                            id: user.id.toString(),
                            name: user.username || user.email || 'User',
                            email: user.email,
                            username: user.username || user.email || 'User',
                            role: user.idRuolo || 0,
                            mode: user.mode || '0'
                        };
                    }
                } else {
                    // Checking legacy MD5
                }

                // 2. Fallback to legacy MD5 check
                try {
                    const md5Password = crypto.createHash('md5').update(credentials.password).digest('hex');
                    // ... (legacy check logic remains same) ...
                    const md5Id = crypto.createHash('md5').update(user.id.toString()).digest('hex');
                    const expectedHash = `${md5Password}:${md5Id}`;

                    // MD5 check (hashes not logged for security)

                    if (user.password === expectedHash) {
                        // Upgrade to bcrypt
                        const newHash = await bcrypt.hash(credentials.password, 10);
                        await prisma.user.update({ where: { id: user.id }, data: { password: newHash } });
                        return {
                            id: user.id.toString(),
                            name: user.username || user.email || 'User',
                            email: user.email,
                            username: user.username || user.email || 'User',
                            role: user.idRuolo || 0,
                            mode: user.mode || '0'
                        };
                    }
                } catch (e) {
                    console.error("Auth error", e);
                }

                return null;
            }
        })
    ],
    session: { strategy: "jwt" },
    pages: { signIn: '/login' },
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.role = user.role;
                token.mode = user.mode;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.username = token.username;
                session.user.role = token.role;
                session.user.mode = token.mode;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "changeme_dev_secret",
    trustHost: true  // Required for Firebase Hosting / Cloud Run proxy
};
