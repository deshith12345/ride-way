import { createHash, randomBytes } from "crypto"
import nodemailer from "nodemailer"

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
    return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
}

function passwordResetMessage({ name, resetUrl }: { name?: string | null; resetUrl: string }) {
    const text = `Set or reset your RideWay password: ${resetUrl}\n\nThis link expires in ${passwordResetTokenMinutes} minutes. If you did not request this link, ignore this email.`
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
            <h2>Set or reset your RideWay password</h2>
            <p>Hello ${name || "there"},</p>
            <p>Use the secure link below to set a RideWay password. This link expires in ${passwordResetTokenMinutes} minutes.</p>
            <p><a href="${resetUrl}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;">Set Password</a></p>
            <p>If you did not request this link, you can safely ignore this email.</p>
        </div>
    `

    return { html, text }
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
    const gmailUser = process.env.GMAIL_USER
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD
    const gmailFrom = process.env.PASSWORD_RESET_FROM_EMAIL || (gmailUser ? `RideWay <${gmailUser}>` : undefined)
    const message = passwordResetMessage({ name, resetUrl })

    if (gmailUser && gmailAppPassword && gmailFrom) {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: gmailUser,
                pass: gmailAppPassword,
            },
        })

        await transporter.sendMail({
            from: gmailFrom,
            to,
            subject: "Set or reset your RideWay password",
            html: message.html,
            text: message.text,
        })

        return true
    }

    return false
}
