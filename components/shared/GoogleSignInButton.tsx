"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AppRole } from "@/lib/authz"
import { cn } from "@/lib/utils"

type GoogleSignInButtonProps = {
  roleRequired: AppRole
  callbackUrl: string
  label?: string
  className?: string
  onError?: (message: string) => void
}

export default function GoogleSignInButton({
  roleRequired,
  callbackUrl,
  label = "Continue with Google",
  className,
  onError,
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleGoogleSignIn() {
    setLoading(true)
    onError?.("")

    try {
      const response = await fetch("/api/auth/google-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleRequired,
          callbackUrl,
          strictRole: roleRequired !== "TRAVELLER",
        }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || "Google sign-in could not be started.")
      }

      await signIn("google", {
        redirectTo: typeof data.callbackUrl === "string" ? data.callbackUrl : callbackUrl,
      })
    } catch (error: any) {
      onError?.(error.message || "Google sign-in could not be started.")
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className={cn(
        "h-12 w-full rounded-lg border-slate-200 bg-white font-bold text-slate-700 shadow-sm hover:bg-slate-50",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <img src="/logos/google.svg" alt="" className="h-5 w-5" />
      )}
      {label}
    </Button>
  )
}
