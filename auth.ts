import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { PrismaAdapter } from "@auth/prisma-adapter"
import type { Provider } from "next-auth/providers"
import { getGoogleProvider } from "@/lib/auth-providers"
import { normalizeRole } from "@/lib/authz"

const providers: Provider[] = []
const googleProvider = getGoogleProvider()
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_LOCK_MS = 15 * 60 * 1000
const MAX_FAILED_LOGINS = 5

type LoginAttempt = {
  count: number
  resetAt: number
  lockedUntil?: number
}

const loginAttempts = new Map<string, LoginAttempt>()

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return forwardedFor || request.headers.get("x-real-ip") || "unknown"
}

function getLoginAttemptKey(email: string, request: Request) {
  return `${getClientIp(request)}:${email}`
}

function isLoginAllowed(key: string) {
  const attempt = loginAttempts.get(key)
  const now = Date.now()

  if (!attempt) return true

  if (attempt.resetAt <= now) {
    loginAttempts.delete(key)
    return true
  }

  if (attempt.lockedUntil && attempt.lockedUntil > now) {
    return false
  }

  return true
}

function recordFailedLogin(key: string) {
  const now = Date.now()
  const attempt = loginAttempts.get(key)

  if (!attempt || attempt.resetAt <= now) {
    loginAttempts.set(key, {
      count: 1,
      resetAt: now + LOGIN_WINDOW_MS,
    })
    return
  }

  const nextCount = attempt.count + 1
  loginAttempts.set(key, {
    count: nextCount,
    resetAt: attempt.resetAt,
    lockedUntil: nextCount >= MAX_FAILED_LOGINS ? now + LOGIN_LOCK_MS : attempt.lockedUntil,
  })
}

function clearFailedLogins(key: string) {
  loginAttempts.delete(key)
}

if (googleProvider) {
  providers.push(googleProvider)
}

providers.push(
  CredentialsProvider({
    id: "credentials",
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      roleRequired: { label: "Required role", type: "text" },
    },
    async authorize(credentials, request) {
      if (!credentials?.email || !credentials?.password) {
        return null
      }

      const email = (credentials.email as string).trim().toLowerCase()
      const requestedRole =
        typeof credentials.roleRequired === "string"
          ? credentials.roleRequired.trim()
          : ""
      const requiredRole = requestedRole ? normalizeRole(requestedRole) : null

      if (requestedRole && !requiredRole) return null

      const loginAttemptKey = getLoginAttemptKey(email, request)
      if (!isLoginAllowed(loginAttemptKey)) return null

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (!user || !user.password) {
        recordFailedLogin(loginAttemptKey)
        return null
      }

      const isPasswordValid = await bcrypt.compare(
        credentials.password as string,
        user.password
      )

      if (!isPasswordValid) {
        recordFailedLogin(loginAttemptKey)
        return null
      }

      if (requiredRole && normalizeRole(user.role) !== requiredRole) {
        return null
      }

      clearFailedLogins(loginAttemptKey)

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: normalizeRole(user.role) ?? undefined,
      }
    },
  })
)

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google") {
          if ((profile as any)?.email_verified === false) return false

          const email = typeof user.email === "string" ? user.email.trim().toLowerCase() : ""
          if (!email) return false
          user.email = email

          const existingUser = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              role: true,
              password: true,
            },
          })

          const existingRole = normalizeRole(existingUser?.role)

          if (!existingUser || existingRole !== "TRAVELLER" || existingUser.password) {
            return false
          }

          user.role = existingRole
          user.id = existingUser.id
        }
        return true
      } catch (error) {
        console.error("SignIn Callback Error:", error)
        return false
      }
    },
    async jwt(params) {
      const token = authConfig.callbacks?.jwt
        ? await authConfig.callbacks.jwt(params as any)
        : params.token
      const userId = token.id as string | undefined
      const email = token.email as string | undefined

      if (userId || email) {
        const dbUser = await prisma.user.findFirst({
          where: userId ? { id: userId } : { email },
          select: { id: true, role: true },
        })

        if (dbUser) {
          const role = normalizeRole(dbUser.role)
          token.id = dbUser.id
          if (role) token.role = role
          else delete token.role
        }
      }

      return token
    },
    async session(params) {
      return authConfig.callbacks?.session
        ? authConfig.callbacks.session(params as any)
        : params.session
    },
  },
})
