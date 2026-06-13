import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "./auth.config"
import { getPortalFromHost, getPortalUrl } from "@/lib/portal"

const { auth } = NextAuth(authConfig)

function matchesRoute(pathname: string, route: string) {
    return pathname === route || pathname.startsWith(`${route}/`)
}

const proxy = auth((req) => {
    const { pathname } = req.nextUrl
    const portal = getPortalFromHost(req.headers.get("host"))
    const isLoggedIn = !!req.auth
    const userRole = req.auth?.user?.role?.toUpperCase()

    const publicRoutes = [
        "/",
        "/about",
        "/api/auth",
        "/api/locations",
        "/api/routes",
        "/api/stats",
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

    if (portal === "admin" && pathname === "/") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    }

    if (portal === "driver" && pathname === "/") {
        return NextResponse.redirect(new URL("/driver/dashboard", req.url))
    }

    if (pathname.startsWith("/admin") && portal !== "admin") {
        return NextResponse.redirect(getPortalUrl("ADMIN", req.url))
    }

    if (pathname.startsWith("/driver") && portal !== "driver") {
        return NextResponse.redirect(getPortalUrl("DRIVER", req.url))
    }

    if (portal === "admin" && !pathname.startsWith("/admin") && !pathname.startsWith("/api") && pathname !== "/login" && pathname !== "/auth/error") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    }

    if (portal === "driver" && !pathname.startsWith("/driver") && !pathname.startsWith("/api") && pathname !== "/login" && pathname !== "/auth/error") {
        return NextResponse.redirect(new URL("/driver/dashboard", req.url))
    }

    if (isAuthRoute && isLoggedIn) {
        return NextResponse.redirect(getPortalUrl(userRole, req.url))
    }

    if (isLoggedIn) {
        if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", req.url))
        }

        if (pathname.startsWith("/driver") && userRole !== "DRIVER") {
            return NextResponse.redirect(new URL("/dashboard", req.url))
        }

        if (pathname === "/dashboard" && (userRole === "ADMIN" || userRole === "DRIVER")) {
            return NextResponse.redirect(getPortalUrl(userRole, req.url))
        }
    }

    if (!isPublicRoute && !isLoggedIn) {
        if (pathname.startsWith("/api")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const loginUrl = new URL("/login", req.url)
        loginUrl.searchParams.set("callbackUrl", `${pathname}${req.nextUrl.search}`)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
})

export default proxy

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)"],
}
