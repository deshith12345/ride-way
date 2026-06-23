import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { normalizeRole } from "@/lib/authz"

// ─── Rate limiting ────────────────────────────────────────────────────────────
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
  attempts.set(key, { count: n, resetAt: a.resetAt, lockedUntil: n >= MAX_FAILED ? now + LOCK_MS : a.lockedUntil })
}

// ─── NextAuth ─────────────────────────────────────────────────────────────────
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  secret:    process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages:     { signIn: "/login", error: "/login" },

  providers: [
    Credentials({
      id:   "credentials",
      name: "credentials",
      credentials: {
        email:        { label: "Email",    type: "email"    },
        password:     { label: "Password", type: "password" },
        roleRequired: { label: "Role",     type: "text"     },
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

        // Portal separation: enforce role on credentials login
        if (roleRequired && userRole !== roleRequired) return null

        attempts.delete(key)
        return { id: user.id, email: user.email, name: user.name, role: userRole }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id
        token.role = (user as any).role ?? "TRAVELLER"
      }
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

    async session({ session, token }) {
      if (session.user) {
        session.user.id             = token.id      as string
        ;(session.user as any).role = token.role
        session.user.name           = token.name    as string | null
        session.user.email          = token.email   as string
        session.user.image          = token.picture as string | null
      }
      return session
    },
  },
})
