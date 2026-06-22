import GoogleProvider from "next-auth/providers/google"
import type { Provider } from "next-auth/providers"

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
