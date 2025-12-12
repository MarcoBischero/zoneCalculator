import NextAuth from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            username: string
            email: string
            role: number
            mode: string
        }
    }

    interface User {
        id: string
        username: string
        email: string | null
        role: number
        mode: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        username: string
        role: number
        mode: string
    }
}
