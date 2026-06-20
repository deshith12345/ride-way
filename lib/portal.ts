import { normalizeRole } from "@/lib/authz"

export type PortalKind = "admin" | "driver" | "public"

export function getPortalFromHost(host: string | null): PortalKind {
  const hostname = (host || "").split(":")[0].toLowerCase()

  if (hostname.startsWith("admin.")) {
    return "admin"
  }

  if (hostname.startsWith("driver.")) {
    return "driver"
  }

  return "public"
}

export function portalPathForRole(role?: string | null) {
  const normalizedRole = normalizeRole(role)

  if (normalizedRole === "ADMIN") return "/admin/dashboard"
  if (normalizedRole === "DRIVER") return "/driver/dashboard"
  if (normalizedRole === "TRAVELLER") return "/dashboard"
  return "/login"
}

export function getPortalUrl(role: string | null | undefined, currentUrl: string) {
  const url = new URL(currentUrl)
  const normalizedRole = normalizeRole(role)

  url.pathname = portalPathForRole(normalizedRole)
  url.search = ""
  return url
}
