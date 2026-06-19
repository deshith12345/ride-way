import { auth } from "@/auth"
import { roleLoginPath } from "@/lib/role-login"
import { redirect } from "next/navigation"

export default async function DriverLayout({
    children,
}: {
    children: React.ReactNode
}) {
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
