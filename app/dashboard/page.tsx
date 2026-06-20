import { auth } from "@/auth"
import { normalizeRole } from "@/lib/authz"
import { portalPathForRole } from "@/lib/portal"
import { redirect } from "next/navigation"
import TravellerDashboard from "./TravellerDashboard"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login?callbackUrl=/dashboard")
    }

    const role = normalizeRole(session.user.role)

    if (role === "ADMIN" || role === "DRIVER") {
        redirect(portalPathForRole(role))
    }

    if (role !== "TRAVELLER") {
        redirect("/login?callbackUrl=/dashboard")
    }

    return <TravellerDashboard />
}
