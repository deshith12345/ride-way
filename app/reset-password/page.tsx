"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, KeyRound, Loader2 } from "lucide-react"
import BrandLogo from "@/components/shared/BrandLogo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

function ResetPasswordContent() {
    const searchParams = useSearchParams()
    const email = useMemo(() => searchParams.get("email") || "", [searchParams])
    const token = useMemo(() => searchParams.get("token") || "", [searchParams])
    const backToLogin = loginHref(searchParams.get("roleRequired"), searchParams.get("callbackUrl"))
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [complete, setComplete] = useState(false)
    const [error, setError] = useState("")
    const hasResetLink = Boolean(email && token)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError("")

        if (!hasResetLink) {
            setError("Reset link is missing or invalid.")
            return
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        setLoading(true)

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, token, password }),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Unable to reset password")

            setComplete(true)
        } catch (err: any) {
            setError(err.message || "Unable to reset password")
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

                        {complete ? (
                            <div className="text-center">
                                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                </div>
                                <h1 className="text-2xl font-black text-slate-900">Password updated</h1>
                                <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
                                    You can now sign in to RideWay using your new password.
                                </p>
                                <Button asChild className="mt-8 h-12 w-full rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700">
                                    <Link href={backToLogin}>Return to Sign In</Link>
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                                    <KeyRound className="h-7 w-7 text-blue-600" />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900">Create a new password</h1>
                                <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
                                    Set a new password for {email || "your RideWay account"}.
                                </p>

                                {!hasResetLink && (
                                    <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                                        Reset link is missing or invalid. Request a new password reset link.
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">New Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            minLength={8}
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                            placeholder="At least 8 characters"
                                            className="h-12 rounded-xl"
                                            disabled={!hasResetLink}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            required
                                            minLength={8}
                                            value={confirmPassword}
                                            onChange={(event) => setConfirmPassword(event.target.value)}
                                            placeholder="Repeat password"
                                            className="h-12 rounded-xl"
                                            disabled={!hasResetLink}
                                        />
                                    </div>
                                    {error && (
                                        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                                            {error}
                                        </div>
                                    )}
                                    <Button type="submit" disabled={loading || !hasResetLink} className="h-12 w-full rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700">
                                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                                        Reset Password
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

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-950"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>}>
            <ResetPasswordContent />
        </Suspense>
    )
}
