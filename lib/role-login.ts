export type PortalRole = "ADMIN" | "DRIVER"

export function roleLoginPath(role: PortalRole, callbackUrl: string, switchAccount = false) {
    const params = new URLSearchParams({
        callbackUrl,
        roleRequired: role,
    })

    if (switchAccount) {
        params.set("switchAccount", "1")
    }

    return `/login?${params.toString()}`
}
