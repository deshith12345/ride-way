import { NextRequest, NextResponse } from "next/server"
import { normalizeRole } from "@/lib/authz"

/**
 * Sets a short-lived cookie recording which portal the user is signing in from.
 * Read by auth.ts to enforce role separation during Google OAuth.
 */
export async function POST(req: NextRequest) {
  const { role } = await req.json().catch(() => ({}))
  const normalizedRole = normalizeRole(role) ?? "TRAVELLER"

  const response = NextResponse.json({ ok: true })
  response.cookies.set("rideway.login-role", normalizedRole, {
    httpOnly: true,
    maxAge: 10 * 60, // 10 minutes — enough to complete OAuth
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
  return response
}
