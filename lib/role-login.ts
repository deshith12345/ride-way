import type { PortalRole } from "@/lib/authz"

export function roleLoginPath(role: PortalRole, callbackUrl: string, switchAccount = false) {
    // Use dedicated portal login pages
    const loginPath =
        role === "ADMIN"  ? "/admin/login"  :
        role === "DRIVER" ? "/driver/login" : "/login"

    const params = new URLSearchParams({ callbackUrl })
    if (switchAccount) params.set("switchAccount", "1")

    return `${loginPath}?${params.toString()}`
}
