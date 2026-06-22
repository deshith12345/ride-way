import { normalizeRole, type AppRole } from "@/lib/authz"

export const googleOAuthIntentCookieName = "rideway.google-oauth-intent"
export const googleOAuthIntentMaxAge = 10 * 60

export type GoogleOAuthIntent = {
  role: AppRole
  callbackUrl: string
  strictRole: boolean
}

function callbackUrlForRole(role?: AppRole | null) {
  if (role === "ADMIN") return "/admin/dashboard"
  if (role === "DRIVER") return "/driver/dashboard"
  return "/dashboard"
}

export function safeOAuthCallbackUrl(value: unknown, fallbackRole?: AppRole | null) {
  if (typeof value !== "string") return callbackUrlForRole(fallbackRole)
  if (!value.startsWith("/") || value.startsWith("//")) return callbackUrlForRole(fallbackRole)
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
  strictRole?: unknown
}) {
  const requestedRole = normalizeRole(input.roleRequired)
  const callbackUrl = safeOAuthCallbackUrl(input.callbackUrl, requestedRole)
  const callbackRole = roleFromCallbackUrl(callbackUrl)
  const role = requestedRole || callbackRole || "TRAVELLER"
  const strictRole =
    input.strictRole === true ||
    Boolean(requestedRole) ||
    role === "ADMIN" ||
    role === "DRIVER"

  if (requestedRole && callbackRole && requestedRole !== callbackRole) {
    return null
  }

  return { role, callbackUrl, strictRole } satisfies GoogleOAuthIntent
}

export function serializeGoogleOAuthIntent(intent: GoogleOAuthIntent) {
  return JSON.stringify(intent)
}

export function parseGoogleOAuthIntent(value?: string | null): GoogleOAuthIntent | null {
  if (!value) return null

  try {
    const parsed = JSON.parse(value) as Partial<GoogleOAuthIntent>
    const role = normalizeRole(parsed.role)
    const callbackUrl = safeOAuthCallbackUrl(parsed.callbackUrl, role)
    const strictRole = parsed.strictRole === true

    if (!role) return null
    return { role, callbackUrl, strictRole }
  } catch {
    return null
  }
}
