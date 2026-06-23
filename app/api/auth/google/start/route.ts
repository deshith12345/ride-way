import { NextRequest, NextResponse } from "next/server"
import { isGoogleAuthConfigured } from "@/lib/auth-providers"
import {
  createGoogleRoleState,
  googleRoleStateCookieName,
  googleRoleStateMaxAge,
  serializeGoogleRoleState,
} from "@/lib/google-auth-flow"

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

  const state = createGoogleRoleState({
    role: body.role,
    roleRequired: body.roleRequired,
    callbackUrl: body.callbackUrl,
  })

  if (!state) {
    return NextResponse.json(
      { error: "Google sign-in could not start from this sign-in area." },
      { status: 400 }
    )
  }

  const response = NextResponse.json({
    ok: true,
    callbackUrl: state.callbackUrl,
  })

  response.cookies.set(googleRoleStateCookieName, serializeGoogleRoleState(state), {
    httpOnly: true,
    maxAge: googleRoleStateMaxAge,
    path: "/",
    sameSite: "lax",
    secure: shouldUseSecureCookies(req),
  })

  return response
}
