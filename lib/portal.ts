export type PortalKind = "admin" | "driver" | "public"

export function getPortalFromHost(host: string | null): PortalKind {
  const hostname = (host || "").split(":")[0].toLowerCase()

  if (hostname === "admin.localhost" || hostname.startsWith("admin.")) {
    return "admin"
  }

  if (hostname === "driver.localhost" || hostname.startsWith("driver.")) {
    return "driver"
  }

  return "public"
}

export function portalPathForRole(role?: string | null) {
  const normalizedRole = role?.toUpperCase()

  if (normalizedRole === "ADMIN") return "/admin/dashboard"
  if (normalizedRole === "DRIVER") return "/driver/dashboard"
  return "/dashboard"
}

export function getPortalUrl(role: string | null | undefined, currentUrl: string) {
  const url = new URL(currentUrl)
  const normalizedRole = role?.toUpperCase()

  if (normalizedRole === "ADMIN" || normalizedRole === "DRIVER") {
    const subdomain = normalizedRole.toLowerCase()
    const parts = url.hostname.split(".")

    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      url.hostname = `${subdomain}.localhost`
    } else if (parts[0] === "admin" || parts[0] === "driver") {
      parts[0] = subdomain
      url.hostname = parts.join(".")
    } else {
      url.hostname = `${subdomain}.${url.hostname}`
    }

    url.pathname = portalPathForRole(normalizedRole)
    url.search = ""
    return url
  }

  url.pathname = "/dashboard"
  url.search = ""
  return url
}
