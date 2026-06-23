import { createHmac, randomUUID, timingSafeEqual } from "crypto"
import { normalizeRole, type AppRole } from "@/lib/authz"

export const googleRoleStateCookieName = "rideway.google-role-state"
export const googleRoleStateMaxAge = 10 * 60

export type GoogleRoleState = {
  role: AppRole
  callbackUrl: string
  expiresAt: number
  nonce: string
}

function signingSecret() {
  return (
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "rideway-local-google-role-state-secret"
  )
}

export function defaultGoogleCallbackUrl(role?: AppRole | null) {
  if (role === "ADMIN") return "/admin/dashboard"
  if (role === "DRIVER") return "/driver/dashboard"
  return "/dashboard"
}

export function roleFromGoogleCallbackUrl(callbackUrl: string) {
  if (callbackUrl.startsWith("/admin")) return "ADMIN"
  if (callbackUrl.startsWith("/driver")) return "DRIVER"
  if (
    callbackUrl === "/dashboard" ||
    callbackUrl.startsWith("/dashboard/") ||
    callbackUrl === "/settings" ||
    callbackUrl.startsWith("/settings/")
  ) {
    return "TRAVELLER"
  }
  return null
}

export function safeGoogleCallbackUrl(value: unknown, role?: AppRole | null) {
  const fallback = defaultGoogleCallbackUrl(role)
  if (typeof value !== "string") return fallback
  if (!value.startsWith("/") || value.startsWith("//")) return fallback

  const callbackRole = roleFromGoogleCallbackUrl(value)
  if (role === "ADMIN" || role === "DRIVER") {
    return callbackRole === role ? value : fallback
  }
  if (callbackRole === "ADMIN" || callbackRole === "DRIVER") return fallback

  return value
}

export function createGoogleRoleState(input: {
  role?: unknown
  roleRequired?: unknown
  callbackUrl?: unknown
}) {
  const requestedRole = normalizeRole(input.role) ?? normalizeRole(input.roleRequired)
  if (!requestedRole) return null

  const rawCallbackRole =
    typeof input.callbackUrl === "string" &&
    input.callbackUrl.startsWith("/") &&
    !input.callbackUrl.startsWith("//")
      ? roleFromGoogleCallbackUrl(input.callbackUrl)
      : null

  if (rawCallbackRole && rawCallbackRole !== requestedRole) return null

  const callbackUrl = safeGoogleCallbackUrl(input.callbackUrl, requestedRole)

  return {
    role: requestedRole,
    callbackUrl,
    expiresAt: Date.now() + googleRoleStateMaxAge * 1000,
    nonce: randomUUID(),
  } satisfies GoogleRoleState
}

function signatureFor(payload: string) {
  return createHmac("sha256", signingSecret()).update(payload).digest("base64url")
}

function signaturesMatch(expected: string, actual: string) {
  const expectedBytes = Buffer.from(expected)
  const actualBytes = Buffer.from(actual)

  return (
    expectedBytes.length === actualBytes.length &&
    timingSafeEqual(expectedBytes, actualBytes)
  )
}

export function serializeGoogleRoleState(state: GoogleRoleState) {
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url")
  return `${payload}.${signatureFor(payload)}`
}

export function parseGoogleRoleState(value?: string | null): GoogleRoleState | null {
  if (!value) return null

  try {
    const [payload, signature] = value.split(".")
    if (!payload || !signature) return null
    if (!signaturesMatch(signatureFor(payload), signature)) return null

    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<GoogleRoleState>
    const role = normalizeRole(parsed.role)
    const callbackUrl = safeGoogleCallbackUrl(parsed.callbackUrl, role)
    const callbackRole = roleFromGoogleCallbackUrl(callbackUrl)

    if (!role || !parsed.nonce || typeof parsed.nonce !== "string") return null
    if (typeof parsed.expiresAt !== "number" || parsed.expiresAt <= Date.now()) return null
    if (callbackRole && callbackRole !== role) return null

    return {
      role,
      callbackUrl,
      expiresAt: parsed.expiresAt,
      nonce: parsed.nonce,
    }
  } catch {
    return null
  }
}
