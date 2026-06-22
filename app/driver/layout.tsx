import { auth } from "@/auth"
import { roleLoginPath } from "@/lib/role-login"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

export default async function DriverLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const headersList = await headers()
    const pathname = headersList.get("x-pathname") || ""

    // Allow the driver login page to render without requiring an existing session
    if (pathname === "/driver/login") {
        return <>{children}</>
    }

    const session = await auth()
    const role = session?.user?.role?.toUpperCase()

    if (!session?.user) {
        redirect(roleLoginPath("DRIVER", "/driver/dashboard"))
    }

    if (role !== "DRIVER") {
        redirect(roleLoginPath("DRIVER", "/driver/dashboard", true))
    }

    return children
}
