"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import BrandLogo from "@/components/shared/BrandLogo"
import { isValidEmailAddress } from "@/lib/validation"

function loginHref(roleRequired: string | null, callbackUrl: string | null) {
  const role = roleRequired?.toUpperCase()
  if (role !== "ADMIN" && role !== "DRIVER") return "/login"

  return `/login?${new URLSearchParams({
    roleRequired: role,
    callbackUrl: callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : role === "ADMIN"
        ? "/admin/dashboard"
        : "/driver/dashboard",
  }).toString()}`
}

function ForgotPasswordContent() {
  const searchParams = useSearchParams()
  const roleRequired = searchParams.get("roleRequired")
  const callbackUrl = searchParams.get("callbackUrl")
  const backToLogin = loginHref(roleRequired, callbackUrl)
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resetUrl, setResetUrl] = useState("")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setResetUrl("")

    if (!isValidEmailAddress(email)) {
      setError("Enter a valid email address.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, roleRequired, callbackUrl }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Unable to start password recovery")

      setSubmitted(true)
      if (typeof data.resetUrl === "string") setResetUrl(data.resetUrl)
    } catch (err: any) {
      setError(err.message || "Unable to start password recovery")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center">
        <Link href={backToLogin} className="mb-8 inline-flex items-center text-sm font-bold text-blue-200 hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
        </Link>
        <Card className="border-white/10 bg-white/95 shadow-2xl">
          <CardContent className="p-8">
            <div className="mb-7 flex justify-center">
              <BrandLogo href="/" size="sm" />
            </div>

            {submitted ? (
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-black text-slate-900">Check your inbox</h1>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
                  If a RideWay account exists for {email.trim().toLowerCase()}, a secure reset link will be sent shortly.
                </p>
                {resetUrl && (
                  <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-left text-xs font-semibold leading-5 text-amber-800">
                    Development reset link:
                    <Link href={resetUrl} className="mt-2 block break-all text-blue-700 underline">
                      {resetUrl}
                    </Link>
                  </div>
                )}
                <Button asChild className="mt-8 h-12 w-full rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700">
                  <Link href={backToLogin}>Return to Sign In</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                  <Mail className="h-7 w-7 text-blue-600" />
                </div>
                <h1 className="text-3xl font-black text-slate-900">Reset your password</h1>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
                  Enter the email address on your RideWay account. The reset link expires after 30 minutes and can be used once.
                </p>
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="name@example.com"
                      className="h-12 rounded-xl"
                    />
                  </div>
                  {error && (
                    <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                      {error}
                    </div>
                  )}
                  <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700">
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    Send Reset Instructions
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-950"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>}>
      <ForgotPasswordContent />
    </Suspense>
  )
}
