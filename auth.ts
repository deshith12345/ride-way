import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"
import { normalizeRole } from "@/lib/authz"

// ─── Credentials rate-limiting ────────────────────────────────────────────────
const MAX_FAILED = 5
const WINDOW_MS  = 15 * 60 * 1000
const LOCK_MS    = 15 * 60 * 1000
type Attempt = { count: number; resetAt: number; lockedUntil?: number }
const attempts = new Map<string, Attempt>()

function canLogin(key: string) {
  const a = attempts.get(key)
  const now = Date.now()
  if (!a || a.resetAt <= now) { attempts.delete(key); return true }
  return !(a.lockedUntil && a.lockedUntil > now)
}
function failedLogin(key: string) {
  const now = Date.now()
  const a = attempts.get(key)
  if (!a || a.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return
  }
  const n = a.count + 1
  attempts.set(key, {
    count: n,
    resetAt: a.resetAt,
    lockedUntil: n >= MAX_FAILED ? now + LOCK_MS : a.lockedUntil,
  })
}

// ─── NextAuth ─────────────────────────────────────────────────────────────────
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: {
    ...(PrismaAdapter(prisma) as any),
    /** New Google users are always created as TRAVELLER */
    async createUser(user: any) {
      return prisma.user.create({
        data: {
          name:          user.name,
          email:         user.email,
          emailVerified: user.emailVerified,
          image:         user.image,
          role:          UserRole.TRAVELLER,
        },
      }) as any
    },
  } as any,

  session: { strategy: "jwt" },
  secret:    process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages:     { signIn: "/login", error: "/login" },

  providers: [
    // ── Google OAuth ──────────────────────────────────────────────────────────
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id:            profile.sub,
          name:          profile.name,
          email:         typeof profile.email === "string"
                           ? profile.email.trim().toLowerCase()
                           : profile.email,
          emailVerified: profile.email_verified ? new Date() : null,
          image:         profile.picture,
          role:          "TRAVELLER",
        }
      },
    }),

    // ── Email / Password ──────────────────────────────────────────────────────
    Credentials({
      id:   "credentials",
      name: "credentials",
      credentials: {
        email:        { label: "Email",        type: "email"    },
        password:     { label: "Password",     type: "password" },
        roleRequired: { label: "Role",         type: "text"     },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null

        const email        = (credentials.email as string).trim().toLowerCase()
        const roleRequired = normalizeRole(credentials.roleRequired as string) ?? null
        const ip           = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
        const key          = `${ip}:${email}`

        if (!canLogin(key)) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user?.password) { failedLogin(key); return null }

        const ok = await bcrypt.compare(credentials.password as string, user.password)
        if (!ok) { failedLogin(key); return null }

        const userRole = normalizeRole(user.role) ?? "TRAVELLER"

        // ── Portal separation: enforce role on credentials login ──────────────
        // Regular portal → TRAVELLER only.
        // Admin / Driver portals → only their respective role.
        if (roleRequired && userRole !== roleRequired) {
          return null // silent failure — wrong portal
        }

        attempts.delete(key)
        return { id: user.id, email: user.email, name: user.name, role: userRole }
      },
    }),
  ],

  callbacks: {
    // ── signIn ────────────────────────────────────────────────────────────────
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google") {
          // 1. Require a verified Google email
          if (!(profile as any)?.email_verified) {
            return "/login?error=EmailNotVerified"
          }
          const email = typeof user.email === "string"
            ? user.email.trim().toLowerCase()
            : ""
          if (!email) return "/login?error=EmailMissing"
          user.email = email

          // 2. Read which portal the user is signing in from
          //    (set by /api/auth/set-login-role just before OAuth)
          const cookieStore   = await cookies()
          const expectedRole  = (cookieStore.get("rideway.login-role")?.value ?? "TRAVELLER") as
                                  "ADMIN" | "DRIVER" | "TRAVELLER"

          // 3. Look up the existing user
          const existing = await prisma.user.findUnique({
            where:  { email },
            select: { id: true, role: true },
          })

          if (existing) {
            const existingRole = normalizeRole(existing.role) ?? "TRAVELLER"

            // ── Portal separation ─────────────────────────────────────────────
            if (existingRole !== expectedRole) {
              if (expectedRole === "TRAVELLER" && (existingRole === "ADMIN" || existingRole === "DRIVER")) {
                // Staff account on regular portal — redirect to their correct portal login (no revealing message)
                const rolePortalLogin = existingRole === "ADMIN"
                  ? "/login?roleRequired=ADMIN&callbackUrl=%2Fadmin%2Fdashboard"
                  : "/login?roleRequired=DRIVER&callbackUrl=%2Fdriver%2Fdashboard"
                return rolePortalLogin
              }
              if ((expectedRole === "ADMIN" || expectedRole === "DRIVER") && existingRole !== expectedRole) {
                // Wrong staff role — generic error
                return `/login?error=Unauthorized&roleRequired=${expectedRole}`
              }
            }

            user.id = existing.id
            ;(user as any).role = existingRole
          } else {
            // New user — only allowed on the regular portal
            if (expectedRole === "ADMIN" || expectedRole === "DRIVER") {
              return `/login?error=Unauthorized&roleRequired=${expectedRole}`
            }
          }  // New TRAVELLER — adapter's createUser will handle creation
        }
        return true
      } catch (err) {
        console.error("SignIn error:", err)
        return "/login?error=SignInFailed"
      }
    },

    // ── jwt ───────────────────────────────────────────────────────────────────
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id
        token.role = (user as any).role ?? "TRAVELLER"
      }
      // Sync role/name/image from DB on every refresh
      if (token.id) {
        try {
          const db = await prisma.user.findUnique({
            where:  { id: token.id as string },
            select: { id: true, role: true, name: true, email: true, image: true },
          })
          if (db) {
            token.id      = db.id
            token.role    = normalizeRole(db.role) ?? "TRAVELLER"
            token.name    = db.name
            token.email   = db.email
            token.picture = db.image
          }
        } catch {}
      }
      return token
    },

    // ── session ───────────────────────────────────────────────────────────────
    async session({ session, token }) {
      if (session.user) {
        session.user.id                  = token.id      as string
        ;(session.user as any).role      = token.role
        session.user.name                = token.name    as string | null
        session.user.email               = token.email   as string
        session.user.image               = token.picture as string | null
      }
      return session
    },
  },
})
