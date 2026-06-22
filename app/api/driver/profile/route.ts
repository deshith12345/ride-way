import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { normalizeRole } from "@/lib/authz"
import { normalizeSriLankanMobile } from "@/lib/validation"

const optionalText = (min: number, max: number) =>
    z.preprocess(
        (value) => {
            if (typeof value !== "string") return value
            const trimmed = value.trim()
            return trimmed.length > 0 ? trimmed : null
        },
        z.string().min(min).max(max).nullable().optional()
    )

const updateDriverProfileSchema = z.object({
    name: z.string().trim().min(2).max(80),
    phone: optionalText(7, 20),
    licenseNumber: optionalText(3, 40),
})

function driverProfileSelect() {
    return {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        phone: true,
        licenseNumber: true,
        isVerified: true,
        createdAt: true,
    }
}

async function requireDriver() {
    const session = await auth()

    if (!session?.user?.id || normalizeRole(session.user.role) !== "DRIVER") {
        return null
    }

    return session
}

export async function GET() {
    try {
        const session = await requireDriver()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const driver = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: driverProfileSelect(),
        })

        if (!driver || normalizeRole(driver.role) !== "DRIVER") {
            return NextResponse.json({ error: "Driver profile not found" }, { status: 404 })
        }

        return NextResponse.json(driver)
    } catch (error) {
        console.error("Fetch driver profile failed:", error)
        return NextResponse.json({ error: "Unable to load driver profile" }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await requireDriver()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const parsed = updateDriverProfileSchema.safeParse(await req.json())
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid driver profile details" }, { status: 400 })
        }

        const updateData: {
            name: string
            phone?: string | null
            licenseNumber?: string | null
        } = {
            name: parsed.data.name,
        }

        if (parsed.data.phone !== undefined) {
            const normalizedPhone = parsed.data.phone === null ? null : normalizeSriLankanMobile(parsed.data.phone)
            if (parsed.data.phone !== null && !normalizedPhone) {
                return NextResponse.json({ error: "Enter a valid Sri Lankan mobile number" }, { status: 400 })
            }
            updateData.phone = normalizedPhone
        }

        if (parsed.data.licenseNumber !== undefined) {
            updateData.licenseNumber = parsed.data.licenseNumber
        }

        const driver = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: driverProfileSelect(),
        })

        return NextResponse.json(driver)
    } catch (error) {
        console.error("Update driver profile failed:", error)
        return NextResponse.json({ error: "Unable to update driver profile" }, { status: 500 })
    }
}
