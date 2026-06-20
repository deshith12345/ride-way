export const appRoles = ["ADMIN", "DRIVER", "TRAVELLER"] as const

export type AppRole = (typeof appRoles)[number]
export type PortalRole = Extract<AppRole, "ADMIN" | "DRIVER">

export function normalizeRole(value: unknown): AppRole | null {
  if (typeof value !== "string") return null

  const role = value.trim().toUpperCase()
  return appRoles.includes(role as AppRole) ? (role as AppRole) : null
}

export function isPortalRole(value: unknown): value is PortalRole {
  const role = normalizeRole(value)
  return role === "ADMIN" || role === "DRIVER"
}

export function isRole(value: unknown, expectedRole: AppRole) {
  return normalizeRole(value) === expectedRole
}
