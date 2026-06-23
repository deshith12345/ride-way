import GoogleProvider from "next-auth/providers/google"
import type { Provider } from "next-auth/providers"
import type { AppRole } from "@/lib/authz"

function firstEnvValue(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim()
    if (value) return value
  }

  return undefined
}

const googleClientId = firstEnvValue(
  "GOOGLE_CLIENT_ID",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_CLIENT_ID"
)
const googleClientSecret = firstEnvValue(
  "GOOGLE_CLIENT_SECRET",
  "AUTH_GOOGLE_SECRET",
  "AUTH_GOOGLE_CLIENT_SECRET"
)

export const isGoogleAuthConfigured = Boolean(googleClientId && googleClientSecret)

function envIsSet(...names: string[]) {
  return names.some((name) => Boolean(process.env[name]?.trim()))
}

export function googleAuthConfigStatus() {
  const clientIdConfigured = envIsSet(
    "GOOGLE_CLIENT_ID",
    "AUTH_GOOGLE_ID",
    "AUTH_GOOGLE_CLIENT_ID"
  )
  const clientSecretConfigured = envIsSet(
    "GOOGLE_CLIENT_SECRET",
    "AUTH_GOOGLE_SECRET",
    "AUTH_GOOGLE_CLIENT_SECRET"
  )

  return {
    configured: clientIdConfigured && clientSecretConfigured,
    clientIdConfigured,
    clientSecretConfigured,
    adminAllowlistConfigured: envIsSet("GOOGLE_ADMIN_SIGNUP_EMAILS", "GOOGLE_ADMIN_EMAILS"),
    driverAllowlistConfigured: envIsSet("GOOGLE_DRIVER_SIGNUP_EMAILS", "GOOGLE_DRIVER_EMAILS"),
  }
}

function emailSetFromEnv(...names: string[]) {
  const values = names.flatMap((name) =>
    (process.env[name] || "")
      .split(/[\s,;]+/)
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  )

  return new Set(values)
}

export function isGoogleSignupAllowedForRole(role: AppRole, email: string) {
  if (role === "TRAVELLER") return true

  const normalizedEmail = email.trim().toLowerCase()
  const allowList =
    role === "ADMIN"
      ? emailSetFromEnv("GOOGLE_ADMIN_SIGNUP_EMAILS", "GOOGLE_ADMIN_EMAILS")
      : emailSetFromEnv("GOOGLE_DRIVER_SIGNUP_EMAILS", "GOOGLE_DRIVER_EMAILS")

  return allowList.has(normalizedEmail) || allowList.has("*")
}

export function getGoogleProvider(): Provider | null {
  if (!googleClientId || !googleClientSecret) {
    return null
  }

  return GoogleProvider({
    clientId: googleClientId,
    clientSecret: googleClientSecret,
    allowDangerousEmailAccountLinking: true,
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: typeof profile.email === "string" ? profile.email.trim().toLowerCase() : profile.email,
        emailVerified: profile.email_verified ? new Date() : null,
        image: profile.picture,
        role: "TRAVELLER",
      }
    },
  })
}
