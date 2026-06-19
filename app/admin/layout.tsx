
import AdminSidebar from "@/components/admin/AdminSidebar"
import { auth } from "@/auth"
import { roleLoginPath } from "@/lib/role-login"
import { redirect } from "next/navigation"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
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
