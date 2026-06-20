import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { verifyTicketAuthenticity } from "@/lib/ticket-verification"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user || session.user.role !== "DRIVER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const verification = await verifyTicketAuthenticity(body, {
            driverId: session.user.id,
            requireAssignedDriver: true,
            consume: true,
        })
        const { httpStatus, ...payload } = verification

        return NextResponse.json(payload, { status: httpStatus })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Unable to verify ticket" }, { status: 500 })
    }
}
