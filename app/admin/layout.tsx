
import AdminSidebar from "@/components/admin/AdminSidebar"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
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
