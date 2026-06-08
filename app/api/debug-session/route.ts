import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await auth()

    return NextResponse.json({
        authenticated: !!session,
        user: session?.user ? {
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
            id: session.user.id
        } : null,
        raw_session: session
    })
}
