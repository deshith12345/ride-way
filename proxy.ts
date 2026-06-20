import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "./auth.config"
import { getPortalFromHost, portalPathForRole } from "@/lib/portal"
import { isPortalRole, normalizeRole } from "@/lib/authz"

const { auth } = NextAuth(authConfig)

function matchesRoute(pathname: string, route: string) {
    return pathname === route || pathname.startsWith(`${route}/`)
}

function requestOrigin(req: any) {
    const host = req.headers.get("host") || req.nextUrl.host
    const forwardedProto = req.headers.get("x-forwarded-proto")
    const protocol = forwardedProto || "https"

    return `${protocol}://${host}`
}

function loginUrlFor(req: any, targetPath: string) {
    const loginUrl = new URL("/login", requestOrigin(req))
    loginUrl.searchParams.set("callbackUrl", targetPath)
    loginUrl.searchParams.set("roleRequired", targetPath.startsWith("/admin") ? "ADMIN" : "DRIVER")
    return loginUrl
}

function redirectToLoginAndClearSession(req: any, targetPath: string) {
    const loginUrl = loginUrlFor(req, targetPath)
    const response = NextResponse.redirect(loginUrl)
    clearSessionCookies(response, req)
    return response
}

function redirectToCurrentPathAndClearSession(req: any) {
    const url = new URL(`${req.nextUrl.pathname}${req.nextUrl.search}`, requestOrigin(req))
    const response = NextResponse.redirect(url)
    clearSessionCookies(response, req)
    return response
}

function unauthorizedAndClearSession(req: any) {
    const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    clearSessionCookies(response, req)
    return response
}

function cookieDomainCandidates(req?: any) {
    const hostname = (req?.headers.get("host") || req?.nextUrl?.host || "").split(":")[0].toLowerCase()
    if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost")) return []

    const parts = hostname.split(".")
    const candidates = new Set<string>([hostname])

    if (parts.length > 2) {
        const parent = parts.slice(1).join(".")
        candidates.add(parent)
        candidates.add(`.${parent}`)
    }

    return Array.from(candidates)
}

function clearSessionCookies(response: NextResponse, req?: any) {
    const authCookieNames = [
        "authjs.session-token",
        "__Secure-authjs.session-token",
        "authjs.callback-url",
        "__Secure-authjs.callback-url",
        "next-auth.session-token",
        "__Secure-next-auth.session-token",
        "next-auth.callback-url",
        "__Secure-next-auth.callback-url",
    ]

    const domains = cookieDomainCandidates(req)
    authCookieNames.forEach((name) => {
        response.cookies.delete(name)
        response.cookies.set(name, "", { expires: new Date(0), maxAge: 0, path: "/" })
        domains.forEach((domain) => {
            response.cookies.set(name, "", { domain, expires: new Date(0), maxAge: 0, path: "/" })
        })
    })
    return response
}

function redirectToPath(req: any, pathname: string) {
    const url = new URL(pathname, requestOrigin(req))
    return NextResponse.redirect(url)
}

function redirectToRolePortal(req: any, role?: string | null) {
    return redirectToPath(req, portalPathForRole(role))
}

function expectedRoleForPortal(portal: ReturnType<typeof getPortalFromHost>) {
    if (portal === "admin") return "ADMIN"
    if (portal === "driver") return "DRIVER"
    return "TRAVELLER"
}

const proxy = auth((req) => {
    const { pathname } = req.nextUrl
    const portal = getPortalFromHost(req.headers.get("host"))
    const isLoggedIn = !!req.auth
    const userRole = normalizeRole(req.auth?.user?.role)
    const expectedPortalRole = expectedRoleForPortal(portal)

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
        "/routes",
        "/search",
        "/terms",
        "/track",
    ]
    const isPublicRoute = publicRoutes.some(route => matchesRoute(pathname, route))

    const authRoutes = ["/login", "/register"]
    const isAuthRoute = authRoutes.includes(pathname)
    const isAuthApiRoute = pathname.startsWith("/api/auth")
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl") || ""
    const callbackRole = callbackUrl.startsWith("/admin")
        ? "ADMIN"
        : callbackUrl.startsWith("/driver")
            ? "DRIVER"
            : null

    if (isLoggedIn && (!userRole || userRole !== expectedPortalRole) && !isAuthApiRoute && pathname !== "/auth/error") {
        if (pathname.startsWith("/api")) {
            return unauthorizedAndClearSession(req)
        }

        if (isAuthRoute || portal === "public") {
            return redirectToCurrentPathAndClearSession(req)
        }

        return redirectToLoginAndClearSession(
            req,
            portal === "admin" ? "/admin/dashboard" : "/driver/dashboard"
        )
    }

    if (portal === "admin" && pathname === "/") {
        return redirectToPath(req, "/admin/dashboard")
    }

    if (portal === "driver" && pathname === "/") {
        return redirectToPath(req, "/driver/dashboard")
    }

    if (portal === "admin" && !pathname.startsWith("/admin") && !pathname.startsWith("/api") && pathname !== "/login" && pathname !== "/register" && pathname !== "/auth/error") {
        return redirectToPath(req, "/admin/dashboard")
    }

    if (portal === "driver" && !pathname.startsWith("/driver") && !pathname.startsWith("/api") && pathname !== "/login" && pathname !== "/register" && pathname !== "/auth/error") {
        return redirectToPath(req, "/driver/dashboard")
    }

    if (isAuthRoute && isLoggedIn) {
        if (callbackRole && userRole !== callbackRole) {
            return clearSessionCookies(NextResponse.next(), req)
        }

        if (!userRole) {
            return clearSessionCookies(NextResponse.next(), req)
        }

        return redirectToRolePortal(req, userRole)
    }

    if (isLoggedIn) {
        if (pathname.startsWith("/admin") && userRole && userRole !== "ADMIN") {
            return redirectToLoginAndClearSession(req, `${pathname}${req.nextUrl.search}`)
        }

        if (pathname.startsWith("/driver") && userRole && userRole !== "DRIVER") {
            return redirectToLoginAndClearSession(req, `${pathname}${req.nextUrl.search}`)
        }

        if (pathname === "/dashboard" && isPortalRole(userRole)) {
            return redirectToRolePortal(req, userRole)
        }
    }

    if (!isPublicRoute && !isLoggedIn) {
        if (pathname.startsWith("/api")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const loginUrl = new URL("/login", requestOrigin(req))
        loginUrl.searchParams.set("callbackUrl", `${pathname}${req.nextUrl.search}`)
        if (pathname.startsWith("/admin")) loginUrl.searchParams.set("roleRequired", "ADMIN")
        if (pathname.startsWith("/driver")) loginUrl.searchParams.set("roleRequired", "DRIVER")
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
})

export default proxy

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)"],
}
