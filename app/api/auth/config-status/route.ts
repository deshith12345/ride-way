import { NextRequest, NextResponse } from "next/server"
import { googleAuthConfigStatus } from "@/lib/auth-providers"
import { isPasswordResetEmailConfigured } from "@/lib/password-reset"

function requestOrigin(req: NextRequest) {
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
  const host = forwardedHost || req.headers.get("host") || req.nextUrl.host
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim()
  const protocol = forwardedProto || req.nextUrl.protocol.replace(":", "") || "https"

  return `${protocol}://${host}`
}

function envIsSet(...names: string[]) {
  return names.some((name) => Boolean(process.env[name]?.trim()))
}

export async function GET(req: NextRequest) {
  const origin = requestOrigin(req)

  return NextResponse.json(
    {
      google: {
        ...googleAuthConfigStatus(),
        redirectUri: `${origin}/api/auth/callback/google`,
      },
      auth: {
        secretConfigured: envIsSet("AUTH_SECRET", "NEXTAUTH_SECRET"),
        urlConfigured: envIsSet("AUTH_URL", "NEXTAUTH_URL"),
      },
      passwordResetEmail: {
        configured: isPasswordResetEmailConfigured(),
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  )
}
