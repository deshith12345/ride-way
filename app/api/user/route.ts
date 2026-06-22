import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"
import { normalizeSriLankanMobile } from "@/lib/validation"

const updateProfileSchema = z.object({
    name: z.string().trim().min(2).max(80).optional(),
    phone: z.string().trim().min(7).max(20).optional(),
})

export async function PATCH(req: Request) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const parsed = updateProfileSchema.safeParse(await req.json())

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid profile data" },
                { status: 400 }
            )
        }

        const { name, phone } = parsed.data

        const updateData: any = {}
        if (name !== undefined) updateData.name = name
        if (phone !== undefined) {
            const normalizedPhone = normalizeSriLankanMobile(phone)
            if (!normalizedPhone) {
                return NextResponse.json(
                    { error: "Enter a valid Sri Lankan mobile number" },
                    { status: 400 }
                )
            }
            updateData.phone = normalizedPhone
        }

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
