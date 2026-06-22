
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getGoogleProvider } from "@/lib/auth-providers"
import { normalizeRole } from "@/lib/authz"

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
                const role = normalizeRole((user as any).role)
                if (role) token.role = role
                token.id = user.id
            }

            const tokenRole = normalizeRole(token.role)
            if (tokenRole) token.role = tokenRole
            else delete token.role

            return token
        },
        async session({ session, token }) {
            if (session.user && token) {
                const role = normalizeRole(token.role)
                if (role) session.user.role = role
                else delete (session.user as any).role

                if (typeof token.id === "string") {
                    session.user.id = token.id
                }
                if (typeof token.name === "string" || token.name === null) {
                    session.user.name = token.name
                }
                if (typeof token.email === "string") {
                    session.user.email = token.email
                }
                if (typeof token.picture === "string") {
                    session.user.image = token.picture
                }
            }
            return session
        },
    },
} satisfies NextAuthConfig
