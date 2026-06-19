import GoogleProvider from "next-auth/providers/google"
import type { Provider } from "next-auth/providers"

const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET

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
        image: profile.picture,
        role: "TRAVELLER",
      }
    },
  })
}
