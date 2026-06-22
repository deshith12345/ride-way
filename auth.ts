import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { UserRole } from "@prisma/client"
import type { Provider } from "next-auth/providers"
import { cookies } from "next/headers"
import { getGoogleProvider } from "@/lib/auth-providers"
import { normalizeRole } from "@/lib/authz"
import {
  googleOAuthIntentCookieName,
  parseGoogleOAuthIntent,
  roleFromCallbackUrl,
  safeOAuthCallbackUrl,
  type GoogleOAuthIntent,
} from "@/lib/google-oauth-intent"

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
const callbackUrlCookieNames = [
  "__Secure-authjs.callback-url",
  "authjs.callback-url",
]

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

async function getGoogleOAuthIntent() {
  try {
    const cookieStore = await cookies()
    const explicitIntent = parseGoogleOAuthIntent(cookieStore.get(googleOAuthIntentCookieName)?.value)
    if (explicitIntent) return explicitIntent

    for (const name of callbackUrlCookieNames) {
      const callbackUrl = cookieStore.get(name)?.value
      const intent = googleOAuthIntentFromCallbackUrl(callbackUrl)
      if (intent) return intent
    }
  } catch {
    return null
  }

  return null
}

function googleOAuthIntentFromCallbackUrl(value?: string | null): GoogleOAuthIntent | null {
  if (!value) return null

  const decodedValue = decodeCookieValue(value)
  const callbackUrl = safeOAuthCallbackUrl(pathFromCallbackValue(decodedValue))
  const role = roleFromCallbackUrl(callbackUrl)

  return role ? { role, callbackUrl } : null
}

function decodeCookieValue(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function pathFromCallbackValue(value: string) {
  try {
    const url = new URL(value)
    return `${url.pathname}${url.search}`
  } catch {
    return value
  }
}

function loginErrorPath(error: string, intent: GoogleOAuthIntent | null) {
  const params = new URLSearchParams({ error })

  if (intent) {
    params.set("callbackUrl", intent.callbackUrl)
    if (intent.role !== "TRAVELLER") {
      params.set("roleRequired", intent.role)
    }
  }

  return `/login?${params.toString()}`
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

const prismaAdapter = PrismaAdapter(prisma) as any
const adapter = {
  ...prismaAdapter,
  async createUser(user: any) {
    const intent = await getGoogleOAuthIntent()
    const role = intent?.role || normalizeRole(user.role) || "TRAVELLER"

    return prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        role: UserRole[role],
      },
    }) as any
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter,
  session: { strategy: "jwt" },
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google") {
          const intent = await getGoogleOAuthIntent()

          if ((profile as any)?.email_verified === false) {
            return loginErrorPath("GoogleEmailUnverified", intent)
          }

          const email = typeof user.email === "string" ? user.email.trim().toLowerCase() : ""
          if (!email) return loginErrorPath("GoogleEmailMissing", intent)
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

          if (existingUser) {
            if (!existingRole) {
              return loginErrorPath("GoogleRoleMissing", intent)
            }

            if (intent?.role && existingRole !== intent.role) {
              return loginErrorPath("GoogleRoleMismatch", intent)
            }

            user.role = existingRole
            user.id = existingUser.id
            return true
          }

          user.role = intent?.role || "TRAVELLER"
        }
        return true
      } catch (error) {
        console.error("SignIn Callback Error:", error)
        return loginErrorPath("GoogleSignInFailed", await getGoogleOAuthIntent())
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
          select: { id: true, role: true, name: true, email: true, image: true },
        })

        if (dbUser) {
          const role = normalizeRole(dbUser.role)
          token.id = dbUser.id
          token.name = dbUser.name
          token.email = dbUser.email
          token.picture = dbUser.image
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
