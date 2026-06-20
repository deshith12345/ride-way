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
    clearSessionCookies(response)
    return response
}

function clearSessionCookies(response: NextResponse) {
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

    authCookieNames.forEach((name) => response.cookies.delete(name))
    return response
}

function redirectToPath(req: any, pathname: string) {
    const url = new URL(pathname, requestOrigin(req))
    return NextResponse.redirect(url)
}

function redirectToRolePortal(req: any, role?: string | null) {
    return redirectToPath(req, portalPathForRole(role))
}

const proxy = auth((req) => {
    const { pathname } = req.nextUrl
    const portal = getPortalFromHost(req.headers.get("host"))
    const isLoggedIn = !!req.auth
    const userRole = normalizeRole(req.auth?.user?.role)

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
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl") || ""
    const callbackRole = callbackUrl.startsWith("/admin")
        ? "ADMIN"
        : callbackUrl.startsWith("/driver")
            ? "DRIVER"
            : null

    if (pathname === "/register" && isLoggedIn) {
        return clearSessionCookies(NextResponse.next())
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
            return clearSessionCookies(NextResponse.next())
        }

        if (!userRole) {
            return clearSessionCookies(NextResponse.next())
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
