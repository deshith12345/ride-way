import { NextRequest, NextResponse } from "next/server"
import {
  googleOAuthIntentCookieName,
  googleOAuthIntentMaxAge,
  resolveGoogleOAuthIntent,
  serializeGoogleOAuthIntent,
} from "@/lib/google-oauth-intent"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const intent = resolveGoogleOAuthIntent({
      roleRequired: body.roleRequired,
      callbackUrl: body.callbackUrl,
    })

    if (!intent) {
      return NextResponse.json(
        { error: "Role and callback URL do not match" },
        { status: 400 }
      )
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set(googleOAuthIntentCookieName, serializeGoogleOAuthIntent(intent), {
      httpOnly: true,
      maxAge: googleOAuthIntentMaxAge,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    return response
  } catch (error) {
    console.error("Google intent error:", error)
    return NextResponse.json(
      { error: "Unable to start Google sign-in" },
      { status: 500 }
    )
  }
}
