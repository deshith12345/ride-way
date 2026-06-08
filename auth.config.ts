
import type { NextAuthConfig } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

export const authConfig = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // This will be overridden in auth.ts because it needs prisma/bcrypt
                return null
            },
        }),
    ],
    pages: {
        signIn: "/login",
        error: "/auth/error",
    },
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            return true
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role
                token.id = user.id
            }

            if (token.role) {
                token.role = (token.role as string).toUpperCase()
            }

            return token
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.role = (token.role as string)?.toUpperCase()
                session.user.id = token.id as string
            }
            return session
        },
    },
} satisfies NextAuthConfig
