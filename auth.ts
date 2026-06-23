import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { normalizeRole, type AppRole } from "@/lib/authz"
import { getGoogleProvider, isGoogleSignupAllowedForRole } from "@/lib/auth-providers"
import {
  googleRoleStateCookieName,
  parseGoogleRoleState,
  safeGoogleCallbackUrl,
} from "@/lib/google-auth-flow"

const MAX_FAILED = 5
const WINDOW_MS = 15 * 60 * 1000
const LOCK_MS = 15 * 60 * 1000
type Attempt = { count: number; resetAt: number; lockedUntil?: number }
const attempts = new Map<string, Attempt>()
const googleProvider = getGoogleProvider()

function canLogin(key: string) {
  const attempt = attempts.get(key)
  const now = Date.now()

  if (!attempt || attempt.resetAt <= now) {
    attempts.delete(key)
    return true
  }

  return !(attempt.lockedUntil && attempt.lockedUntil > now)
}

function failedLogin(key: string) {
  const now = Date.now()
  const attempt = attempts.get(key)

  if (!attempt || attempt.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return
  }

  const count = attempt.count + 1
  attempts.set(key, {
    count,
    resetAt: attempt.resetAt,
    lockedUntil: count >= MAX_FAILED ? now + LOCK_MS : attempt.lockedUntil,
  })
}

async function currentGoogleRoleState() {
  try {
    const cookieStore = await cookies()
    return parseGoogleRoleState(cookieStore.get(googleRoleStateCookieName)?.value)
  } catch {
    return null
  }
}

function portalLoginRedirect(role: AppRole, callbackUrl: string, error: string) {
  const loginPath =
    role === "ADMIN" ? "/admin/login" :
    role === "DRIVER" ? "/driver/login" : "/login"
  const params = new URLSearchParams({ callbackUrl, error })

  return `${loginPath}?${params.toString()}`
}

function googleProfileEmail(userEmail: unknown, profile: unknown) {
  const profileEmail =
    typeof (profile as any)?.email === "string" ? (profile as any).email : null
  const email = typeof userEmail === "string" ? userEmail : profileEmail

  return email?.trim().toLowerCase() || null
}

function isGoogleEmailVerified(user: unknown, profile: unknown) {
  const profileVerified = (profile as any)?.email_verified
  if (typeof profileVerified === "boolean") return profileVerified

  return Boolean((user as any)?.emailVerified)
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: { signIn: "/login", error: "/login" },

  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        roleRequired: { label: "Role", type: "text" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null

        const email = (credentials.email as string).trim().toLowerCase()
        const roleRequired = normalizeRole(credentials.roleRequired as string) ?? null
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
        const key = `${ip}:${email}`

        if (!canLogin(key)) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user?.password) {
          failedLogin(key)
          return null
        }

        const ok = await bcrypt.compare(credentials.password as string, user.password)
        if (!ok) {
          failedLogin(key)
          return null
        }

        const userRole = normalizeRole(user.role) ?? "TRAVELLER"

        if (roleRequired && userRole !== roleRequired) return null

        attempts.delete(key)
        return { id: user.id, email: user.email, name: user.name, role: userRole }
      },
    }),
    ...(googleProvider ? [googleProvider] : []),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true

      const roleState = await currentGoogleRoleState()
      const requestedRole = roleState?.role ?? "TRAVELLER"
      const callbackUrl = safeGoogleCallbackUrl(roleState?.callbackUrl, requestedRole)
      const email = googleProfileEmail(user.email, profile)

      if (!email) {
        return portalLoginRedirect(requestedRole, callbackUrl, "OAuthEmailMissing")
      }

      if (!isGoogleEmailVerified(user, profile)) {
        return portalLoginRedirect(requestedRole, callbackUrl, "OAuthEmailNotVerified")
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, role: true },
      })

      if (existingUser) {
        const existingRole = normalizeRole(existingUser.role) ?? "TRAVELLER"

        if (existingRole !== requestedRole) {
          return portalLoginRedirect(requestedRole, callbackUrl, "OAuthRoleMismatch")
        }

        ;(user as any).role = existingRole
        user.email = email
        return true
      }

      if (requestedRole !== "TRAVELLER" && !isGoogleSignupAllowedForRole(requestedRole, email)) {
        return portalLoginRedirect(requestedRole, callbackUrl, "OAuthRoleSignupRestricted")
      }

      ;(user as any).role = requestedRole
      user.email = email
      return true
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role ?? "TRAVELLER"
      }
      if (token.id) {
        try {
          const db = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { id: true, role: true, name: true, email: true, image: true },
          })
          if (db) {
            token.id = db.id
            token.role = normalizeRole(db.role) ?? "TRAVELLER"
            token.name = db.name
            token.email = db.email
            token.picture = db.image
          }
        } catch {}
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
        session.user.name = token.name as string | null
        session.user.email = token.email as string
        session.user.image = token.picture as string | null
      }
      return session
    },
  },

  events: {
    async createUser({ user }) {
      if (!user.id || !user.email) return

      const roleState = await currentGoogleRoleState()
      const role = roleState?.role ?? normalizeRole((user as any).role) ?? "TRAVELLER"
      const email = user.email.trim().toLowerCase()

      if (role !== "TRAVELLER" && !isGoogleSignupAllowedForRole(role, email)) return

      await prisma.user.update({
        where: { id: user.id },
        data: {
          email,
          emailVerified: (user as any).emailVerified ?? new Date(),
          role,
        },
      })
    },
  },
})
