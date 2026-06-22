
import AdminSidebar from "@/components/admin/AdminSidebar"
import { auth } from "@/auth"
import { roleLoginPath } from "@/lib/role-login"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const headersList = await headers()
    const pathname = headersList.get("x-pathname") || ""

    // Allow the admin login page to render without requiring an existing session
    if (pathname === "/admin/login") {
        return <>{children}</>
    }

    const session = await auth()
    const role = session?.user?.role?.toUpperCase()

    if (!session?.user) {
        redirect(roleLoginPath("ADMIN", "/admin/dashboard"))
    }

    if (role !== "ADMIN") {
        redirect(roleLoginPath("ADMIN", "/admin/dashboard", true))
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <AdminSidebar />
            <div className="flex-1 overflow-y-auto">
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
