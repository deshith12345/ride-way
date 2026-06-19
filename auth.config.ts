
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getGoogleProvider } from "@/lib/auth-providers"

const providers = []
const googleProvider = getGoogleProvider()

if (googleProvider) {
    providers.push(googleProvider)
}

providers.push(
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
    })
)

export const authConfig = {
    providers,
    pages: {
        signIn: "/login",
        error: "/auth/error",
    },
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
    trustHost: true,
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            return true
        },
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`

            try {
                const target = new URL(url)
                if (target.origin === baseUrl) return target.toString()
            } catch {
                return baseUrl
            }

            return baseUrl
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
