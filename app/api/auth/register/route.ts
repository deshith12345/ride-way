import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { isValidEmailAddress, normalizeSriLankanMobile } from "@/lib/validation"

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().trim().toLowerCase().refine(isValidEmailAddress, "Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password is too long"),
    phone: z.string().trim().min(1, "Phone number is required"),
    role: z.enum(["ADMIN", "DRIVER", "TRAVELLER"]).default("TRAVELLER"),
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        // Validate input
        const validatedData = registerSchema.parse(body)
        const normalizedPhone = normalizeSriLankanMobile(validatedData.phone)

        if (!normalizedPhone) {
            return NextResponse.json(
                { error: "Enter a valid Sri Lankan mobile number" },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10)

        // Create user
        const user = await prisma.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                password: hashedPassword,
                phone: normalizedPhone,
                role: UserRole[validatedData.role],
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        })

        return NextResponse.json(
            {
                message: "User created successfully",
                user,
            },
            { status: 201 }
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation error", details: error.issues },
                { status: 400 }
            )
        }

        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
