import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getPortalFromHost, portalPathForRole } from "@/lib/portal"
import { isPortalRole, normalizeRole } from "@/lib/authz"

type RoleName = "ADMIN" | "DRIVER" | "TRAVELLER"
type PortalKind = ReturnType<typeof getPortalFromHost>

const defaultSessionCookieNames = [
    "__Secure-authjs.session-token",
    "authjs.session-token",
]

const roleSessionCookieNames: Record<RoleName, string> = {
    ADMIN: "rideway.admin.session-token",
    DRIVER: "rideway.driver.session-token",
    TRAVELLER: "rideway.traveller.session-token",
}

const roleSessionMaxAge = 60 * 60 * 24 * 30

function matchesRoute(pathname: string, route: string) {
    return pathname === route || pathname.startsWith(`${route}/`)
}

function requestOrigin(req: NextRequest) {
    const host = req.headers.get("host") || req.nextUrl.host
    const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim()
    const protocol = forwardedProto || req.nextUrl.protocol.replace(":", "") || "http"

    return `${protocol}://${host}`
}

function shouldUseSecureCookies(req: NextRequest) {
    const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim()
    const protocol = forwardedProto || req.nextUrl.protocol.replace(":", "")

    return protocol === "https"
}

function roleForPath(pathname: string) {
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) return "ADMIN"
    if (pathname.startsWith("/driver") || pathname.startsWith("/api/driver")) return "DRIVER"
    if (
        pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/") ||
        pathname === "/settings" ||
        pathname.startsWith("/settings/") ||
        pathname.startsWith("/api/user") ||
        pathname.startsWith("/api/checkout")
    ) {
        return "TRAVELLER"
    }
    return null
}

function roleForReferer(req: NextRequest) {
    const referer = req.headers.get("referer")
    if (!referer) return null

    try {
        return roleForPath(new URL(referer).pathname)
    } catch {
        return null
    }
}

function roleForPortal(portal: PortalKind) {
    if (portal === "admin") return "ADMIN"
    if (portal === "driver") return "DRIVER"
    return "TRAVELLER"
}

function expectedRoleForRequest(
    req: NextRequest,
    portal: PortalKind,
    requestedAuthRole?: string | null
) {
    const { pathname } = req.nextUrl
    const normalizedRequestedRole = normalizeRole(requestedAuthRole)

    if (normalizedRequestedRole) return normalizedRequestedRole
    if (pathname.startsWith("/api/auth/session") || pathname.startsWith("/api/auth/signout")) {
        return roleForReferer(req) || roleForPortal(portal)
    }
    if (pathname.startsWith("/api/support") || pathname.startsWith("/api/trips")) {
        return roleForReferer(req) || roleForPath(pathname) || roleForPortal(portal)
    }
    return roleForPath(pathname) || roleForPortal(portal)
}

function loginUrlFor(req: NextRequest, targetPath: string, role: RoleName) {
    const loginUrl = new URL("/login", requestOrigin(req))
    loginUrl.searchParams.set("callbackUrl", targetPath)
    loginUrl.searchParams.set("roleRequired", role)
    return loginUrl
}

function redirectToLogin(req: NextRequest, targetPath: string, role: RoleName) {
    return NextResponse.redirect(loginUrlFor(req, targetPath, role))
}

function redirectToPath(req: NextRequest, pathname: string) {
    const url = new URL(pathname, requestOrigin(req))
    return NextResponse.redirect(url)
}

function redirectToRolePortal(req: NextRequest, role?: string | null) {
    return redirectToPath(req, portalPathForRole(role))
}

function parseCookieHeader(cookieHeader: string | null) {
    const cookies = new Map<string, string>()
    if (!cookieHeader) return cookies

    cookieHeader.split(";").forEach((part) => {
        const index = part.indexOf("=")
        if (index === -1) return

        const name = part.slice(0, index).trim()
        const value = part.slice(index + 1).trim()
        if (!name) return

        try {
            cookies.set(name, decodeURIComponent(value))
        } catch {
            cookies.set(name, value)
        }
    })

    return cookies
}

function serializeCookieHeader(cookies: Map<string, string>) {
    return Array.from(cookies.entries())
        .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
        .join("; ")
}

function removeDefaultSessionCookies(cookies: Map<string, string>) {
    for (const name of Array.from(cookies.keys())) {
        if (defaultSessionCookieNames.some((cookieName) => name === cookieName || name.startsWith(`${cookieName}.`))) {
            cookies.delete(name)
        }
    }
}

function requestHeadersWithSession(req: NextRequest, rawToken?: string | null) {
    const headers = new Headers(req.headers)
    const cookies = parseCookieHeader(req.headers.get("cookie"))

    removeDefaultSessionCookies(cookies)
    if (rawToken) {
        defaultSessionCookieNames.forEach((name) => cookies.set(name, rawToken))
    }

    headers.set("cookie", serializeCookieHeader(cookies))
    return headers
}

async function readJwt(req: NextRequest, cookieName: string, salt: string) {
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    if (!secret) return null

    try {
        return await getToken({
            req,
            secret,
            cookieName,
            salt,
        })
    } catch {
        return null
    }
}

async function readRawToken(req: NextRequest, cookieName: string, salt: string) {
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    if (!secret) return null

    try {
        return await getToken({
            req,
            secret,
            cookieName,
            salt,
            raw: true,
        })
    } catch {
        return null
    }
}

async function readDefaultSession(req: NextRequest) {
    for (const cookieName of defaultSessionCookieNames) {
        const token = await readJwt(req, cookieName, cookieName)
        if (!token) continue

        const role = normalizeRole(token.role)
        const rawToken = await readRawToken(req, cookieName, cookieName)
        if (role && rawToken) return { role, rawToken }
    }

    return null
}

async function readRoleSession(req: NextRequest, role: RoleName) {
    const cookieName = roleSessionCookieNames[role]

    for (const salt of defaultSessionCookieNames) {
        const token = await readJwt(req, cookieName, salt)
        if (!token || normalizeRole(token.role) !== role) continue

        const rawToken = await readRawToken(req, cookieName, salt)
        if (rawToken) return { role, rawToken }
    }

    return null
}

async function selectSessionForRole(req: NextRequest, expectedRole: RoleName) {
    const roleSession = await readRoleSession(req, expectedRole)
    if (roleSession) {
        return {
            ...roleSession,
            shouldPersistRoleCookie: false,
        }
    }

    const defaultSession = await readDefaultSession(req)
    if (defaultSession?.role === expectedRole) {
        return {
            ...defaultSession,
            shouldPersistRoleCookie: true,
        }
    }

    return null
}

function setRoleSessionCookie(response: NextResponse, role: RoleName, rawToken: string, secure: boolean) {
    response.cookies.set(roleSessionCookieNames[role], rawToken, {
        httpOnly: true,
        maxAge: roleSessionMaxAge,
        path: "/",
        sameSite: "lax",
        secure,
    })
}

function deleteRoleSessionCookie(response: NextResponse, role: RoleName, secure: boolean) {
    response.cookies.set(roleSessionCookieNames[role], "", {
        expires: new Date(0),
        maxAge: 0,
        path: "/",
        sameSite: "lax",
        secure,
    })
}

function nextWithSelectedSession(
    req: NextRequest,
    selectedSession: Awaited<ReturnType<typeof selectSessionForRole>>,
    expectedRole: RoleName
) {
    const response = NextResponse.next({
        request: {
            headers: requestHeadersWithSession(req, selectedSession?.rawToken),
        },
    })

    if (selectedSession?.shouldPersistRoleCookie) {
        setRoleSessionCookie(response, expectedRole, selectedSession.rawToken, shouldUseSecureCookies(req))
    }

    return response
}

export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl
    const portal = getPortalFromHost(req.headers.get("host"))

    const publicRoutes = [
        "/",
        "/about",
        "/auth/error",
        "/api/auth",
        "/api/locations",
        "/api/routes",
        "/api/stats",
        "/api/track",
        "/api/trips",
        "/contact",
        "/forgot-password",
        "/help",
        "/login",
        "/privacy",
        "/register",
        "/reset-password",
        "/routes",
        "/search",
        "/terms",
        "/ticket/verify",
        "/track",
    ]
    const isPublicRoute = publicRoutes.some((route) => matchesRoute(pathname, route))

    const authRoutes = ["/login", "/register"]
    const isAuthRoute = authRoutes.includes(pathname)
    const isAuthApiRoute = pathname.startsWith("/api/auth")
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl") || ""
    const requestedRole = normalizeRole(req.nextUrl.searchParams.get("roleRequired"))
    const callbackRole = callbackUrl.startsWith("/admin")
        ? "ADMIN"
        : callbackUrl.startsWith("/driver")
            ? "DRIVER"
            : callbackUrl.startsWith("/dashboard")
                ? "TRAVELLER"
                : null
    const expectedRole = expectedRoleForRequest(req, portal, callbackRole || requestedRole)
    const selectedSession = await selectSessionForRole(req, expectedRole)
    const isLoggedIn = Boolean(selectedSession)
    const userRole = selectedSession?.role || null

    if (pathname.startsWith("/api/auth/signout")) {
        const response = nextWithSelectedSession(req, selectedSession, expectedRole)
        deleteRoleSessionCookie(response, expectedRole, shouldUseSecureCookies(req))
        return response
    }

    if (pathname.startsWith("/api/auth/session")) {
        return nextWithSelectedSession(req, selectedSession, expectedRole)
    }

    if (isAuthApiRoute) {
        return NextResponse.next()
    }

    if (portal === "admin" && pathname === "/") {
        return redirectToPath(req, "/admin/dashboard")
    }

    if (portal === "driver" && pathname === "/") {
        return redirectToPath(req, "/driver/dashboard")
    }

    if (portal === "admin" && !pathname.startsWith("/admin") && !pathname.startsWith("/api") && pathname !== "/login" && pathname !== "/register" && pathname !== "/forgot-password" && pathname !== "/reset-password" && pathname !== "/auth/error" && pathname !== "/ticket/verify") {
        return redirectToPath(req, "/admin/dashboard")
    }

    if (portal === "driver" && !pathname.startsWith("/driver") && !pathname.startsWith("/api") && pathname !== "/login" && pathname !== "/register" && pathname !== "/forgot-password" && pathname !== "/reset-password" && pathname !== "/auth/error" && pathname !== "/ticket/verify") {
        return redirectToPath(req, "/driver/dashboard")
    }

    if (isAuthRoute) {
        if (isLoggedIn) return redirectToRolePortal(req, userRole)
        return nextWithSelectedSession(req, selectedSession, expectedRole)
    }

    if (isLoggedIn && pathname === "/dashboard" && isPortalRole(userRole)) {
        return nextWithSelectedSession(req, selectedSession, expectedRole)
    }

    if (!isPublicRoute && !isLoggedIn) {
        if (pathname.startsWith("/api")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        return redirectToLogin(req, `${pathname}${req.nextUrl.search}`, expectedRole)
    }

    return nextWithSelectedSession(req, selectedSession, expectedRole)
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)"],
}
