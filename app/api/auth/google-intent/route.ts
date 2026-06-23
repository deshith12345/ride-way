import { NextRequest, NextResponse } from "next/server"
import { isGoogleAuthConfigured } from "@/lib/auth-providers"
import {
  googleOAuthIntentCookieName,
  googleOAuthIntentMaxAge,
  resolveGoogleOAuthIntent,
  serializeGoogleOAuthIntent,
} from "@/lib/google-oauth-intent"

function shouldUseSecureCookies(req: NextRequest) {
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim()
  const protocol = forwardedProto || req.nextUrl.protocol.replace(":", "")

  return protocol === "https"
}

export async function POST(req: NextRequest) {
  if (!isGoogleAuthConfigured) {
    return NextResponse.json(
      { error: "Google sign-in is not configured yet." },
      { status: 503 }
    )
  }

  let body: Record<string, unknown> = {}

  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const intent = resolveGoogleOAuthIntent({
    roleRequired: body.roleRequired,
    callbackUrl: body.callbackUrl,
    strictRole: body.strictRole,
  })

  if (!intent) {
    return NextResponse.json(
      { error: "Google sign-in could not start from this portal." },
      { status: 400 }
    )
  }

  const response = NextResponse.json({
    ok: true,
    callbackUrl: intent.callbackUrl,
  })

  response.cookies.set(googleOAuthIntentCookieName, serializeGoogleOAuthIntent(intent), {
    httpOnly: true,
    maxAge: googleOAuthIntentMaxAge,
    path: "/",
    sameSite: "lax",
    secure: shouldUseSecureCookies(req),
  })

  return response
}
