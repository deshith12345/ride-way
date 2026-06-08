import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)
import { NextResponse } from "next/server"

export default auth((req) => {
    const { pathname } = req.nextUrl
    const isLoggedIn = !!req.auth
    const userRole = req.auth?.user?.role?.toUpperCase()

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/login", "/register", "/search", "/routes"]
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // Auth routes (redirect if already logged in)
    const authRoutes = ["/login", "/register"]
    const isAuthRoute = authRoutes.includes(pathname)

    if (isAuthRoute && isLoggedIn) {
        // Redirect logged-in users away from auth pages
        if (userRole === "ADMIN") {
            return NextResponse.redirect(new URL("/admin/dashboard", req.url))
        } else if (userRole === "DRIVER") {
            return NextResponse.redirect(new URL("/driver/dashboard", req.url))
        } else {
            return NextResponse.redirect(new URL("/dashboard", req.url))
        }
    }

    // Role-based access control
    if (isLoggedIn) {

        // Admin routes
        if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", req.url))
        }

        // Driver routes
        if (pathname.startsWith("/driver") && userRole !== "DRIVER") {
            return NextResponse.redirect(new URL("/dashboard", req.url))
        }

        // Catch-all for /dashboard
        if (pathname === "/dashboard") {
            if (userRole === "ADMIN") {
                return NextResponse.redirect(new URL("/admin/dashboard", req.url))
            } else if (userRole === "DRIVER") {
                return NextResponse.redirect(new URL("/driver/dashboard", req.url))
            }
        }
    }

    // Protected routes
    if (!isPublicRoute && !isLoggedIn) {
        const loginUrl = new URL("/login", req.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
