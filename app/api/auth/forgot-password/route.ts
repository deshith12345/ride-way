import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isValidEmailAddress } from "@/lib/validation"
import {
    createPasswordResetToken,
    isPasswordResetEmailConfigured,
    passwordResetExpiry,
    passwordResetIdentifier,
    sendPasswordResetEmail,
} from "@/lib/password-reset"
import { normalizeRole } from "@/lib/authz"

const genericMessage = "If a RideWay account exists for that email, reset instructions will be sent shortly."

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
        const roleRequired = normalizeRole(body.roleRequired)
        const callbackUrl = typeof body.callbackUrl === "string" && body.callbackUrl.startsWith("/") && !body.callbackUrl.startsWith("//")
            ? body.callbackUrl
            : roleRequired === "ADMIN"
                ? "/admin/dashboard"
                : roleRequired === "DRIVER"
                    ? "/driver/dashboard"
                    : "/dashboard"

        if (!isValidEmailAddress(email)) {
            return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 })
        }

        if (process.env.NODE_ENV === "production" && !isPasswordResetEmailConfigured()) {
            return NextResponse.json(
                { error: "Password recovery email is not configured. Add RESEND_API_KEY and PASSWORD_RESET_FROM_EMAIL in Vercel." },
                { status: 503 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: { email: true, name: true },
        })

        if (!user) {
            return NextResponse.json({ message: genericMessage })
        }

        const { token, tokenHash } = createPasswordResetToken()
        const identifier = passwordResetIdentifier(email)

        await prisma.verificationToken.deleteMany({ where: { identifier } })
        await prisma.verificationToken.create({
            data: {
                identifier,
                token: tokenHash,
                expires: passwordResetExpiry(),
            },
        })

        const resetUrl = new URL("/reset-password", req.nextUrl.origin)
        resetUrl.searchParams.set("email", email)
        resetUrl.searchParams.set("token", token)
        if (roleRequired && roleRequired !== "TRAVELLER") {
            resetUrl.searchParams.set("roleRequired", roleRequired)
            resetUrl.searchParams.set("callbackUrl", callbackUrl)
        }

        try {
            await sendPasswordResetEmail({
                to: email,
                name: user.name,
                resetUrl: resetUrl.toString(),
            })
        } catch (error) {
            console.error("Password reset email delivery failed:", error)
        }

        return NextResponse.json({
            message: genericMessage,
            resetUrl: process.env.NODE_ENV === "production" ? undefined : resetUrl.toString(),
        })
    } catch (error) {
        console.error("Forgot password request failed:", error)
        return NextResponse.json({ error: "Unable to start password recovery" }, { status: 500 })
    }
}
