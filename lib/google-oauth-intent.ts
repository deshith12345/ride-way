import { normalizeRole, type AppRole } from "@/lib/authz"

export const googleOAuthIntentCookieName = "rideway.google-oauth-intent"
export const googleOAuthIntentMaxAge = 10 * 60

export type GoogleOAuthIntent = {
  role: AppRole
  callbackUrl: string
}

export function safeOAuthCallbackUrl(value: unknown) {
  if (typeof value !== "string") return "/dashboard"
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard"
  return value
}

export function roleFromCallbackUrl(callbackUrl: string) {
  if (callbackUrl.startsWith("/admin")) return "ADMIN"
  if (callbackUrl.startsWith("/driver")) return "DRIVER"
  if (callbackUrl.startsWith("/dashboard")) return "TRAVELLER"
  return null
}

export function resolveGoogleOAuthIntent(input: {
  roleRequired?: unknown
  callbackUrl?: unknown
}) {
  const callbackUrl = safeOAuthCallbackUrl(input.callbackUrl)
  const requestedRole = normalizeRole(input.roleRequired)
  const callbackRole = roleFromCallbackUrl(callbackUrl)
  const role = requestedRole || callbackRole || "TRAVELLER"

  if (requestedRole && callbackRole && requestedRole !== callbackRole) {
    return null
  }

  return { role, callbackUrl } satisfies GoogleOAuthIntent
}

export function serializeGoogleOAuthIntent(intent: GoogleOAuthIntent) {
  return JSON.stringify(intent)
}

export function parseGoogleOAuthIntent(value?: string | null): GoogleOAuthIntent | null {
  if (!value) return null

  try {
    const parsed = JSON.parse(value) as Partial<GoogleOAuthIntent>
    const role = normalizeRole(parsed.role)
    const callbackUrl = safeOAuthCallbackUrl(parsed.callbackUrl)

    if (!role) return null
    return { role, callbackUrl }
  } catch {
    return null
  }
}
