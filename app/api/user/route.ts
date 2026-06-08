import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { name, phone } = await req.json()

        const updateData: any = {}
        if (name !== undefined) updateData.name = name
        if (phone !== undefined) updateData.phone = phone

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: { id: true, name: true, email: true, phone: true },
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error("Profile update error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function DELETE() {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Delete the user. Cascading deletes for Bookings, Reviews, Accounts, and Sessions 
        // are handled by Prisma/MongoDB as defined in the schema.
        await prisma.user.delete({
            where: {
                id: session.user.id
            }
        })

        return NextResponse.json(
            { message: "Account deleted successfully" },
            { status: 200 }
        )
    } catch (error) {
        console.error("Account deletion error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
