import { createHash, randomBytes } from "crypto"

export const passwordResetTokenMinutes = 30

export function createPasswordResetToken() {
    const token = randomBytes(32).toString("base64url")
    return {
        token,
        tokenHash: hashPasswordResetToken(token),
    }
}

export function hashPasswordResetToken(token: string) {
    return createHash("sha256").update(token).digest("hex")
}

export function passwordResetIdentifier(email: string) {
    return `password-reset:${email.trim().toLowerCase()}`
}

export function passwordResetExpiry() {
    return new Date(Date.now() + passwordResetTokenMinutes * 60 * 1000)
}

export function isPasswordResetEmailConfigured() {
    return Boolean(process.env.RESEND_API_KEY && (process.env.PASSWORD_RESET_FROM_EMAIL || process.env.RESEND_FROM_EMAIL))
}

export async function sendPasswordResetEmail({
    to,
    name,
    resetUrl,
}: {
    to: string
    name?: string | null
    resetUrl: string
}) {
    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.PASSWORD_RESET_FROM_EMAIL || process.env.RESEND_FROM_EMAIL

    if (!apiKey || !from) return false

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from,
            to,
            subject: "Reset your RideWay password",
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
                    <h2>Reset your RideWay password</h2>
                    <p>Hello ${name || "there"},</p>
                    <p>Use the secure link below to reset your RideWay password. This link expires in ${passwordResetTokenMinutes} minutes.</p>
                    <p><a href="${resetUrl}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;">Reset Password</a></p>
                    <p>If you did not request this reset, you can safely ignore this email.</p>
                </div>
            `,
            text: `Reset your RideWay password: ${resetUrl}\n\nThis link expires in ${passwordResetTokenMinutes} minutes. If you did not request this reset, ignore this email.`,
        }),
    })

    if (!response.ok) {
        const body = await response.text().catch(() => "")
        throw new Error(`Password reset email failed: ${response.status} ${body}`)
    }

    return true
}
