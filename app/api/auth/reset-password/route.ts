import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { hashPasswordResetToken, passwordResetIdentifier } from "@/lib/password-reset"
import { isValidEmailAddress } from "@/lib/validation"

const resetPasswordSchema = z.object({
    email: z.string().trim().toLowerCase().refine(isValidEmailAddress, "Invalid email address"),
    token: z.string().trim().min(20, "Invalid reset token"),
    password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password is too long"),
})

export async function POST(req: NextRequest) {
    try {
        const parsed = resetPasswordSchema.safeParse(await req.json())
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || "Invalid reset request" },
                { status: 400 }
            )
        }

        const { email, token, password } = parsed.data
        const identifier = passwordResetIdentifier(email)
        const tokenHash = hashPasswordResetToken(token)
        const resetToken = await prisma.verificationToken.findFirst({
            where: {
                identifier,
                token: tokenHash,
                expires: { gt: new Date() },
            },
        })

        if (!resetToken) {
            return NextResponse.json({ error: "Reset link is invalid or expired" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        })

        if (!user) {
            await prisma.verificationToken.deleteMany({ where: { identifier } })
            return NextResponse.json({ error: "Reset link is invalid or expired" }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            }),
            prisma.verificationToken.deleteMany({ where: { identifier } }),
        ])

        return NextResponse.json({ message: "Password updated successfully" })
    } catch (error) {
        console.error("Reset password failed:", error)
        return NextResponse.json({ error: "Unable to reset password" }, { status: 500 })
    }
}
