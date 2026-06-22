"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { getProviders, signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import BrandLogo from "@/components/shared/BrandLogo"

function AdminLoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session } = useSession()
    const [formData, setFormData] = useState({ email: "", password: "" })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [googleEnabled, setGoogleEnabled] = useState(false)

    const callbackUrl = (() => {
        const cb = searchParams.get("callbackUrl")
        return cb?.startsWith("/") && !cb.startsWith("//") ? cb : "/admin/dashboard"
    })()

    useEffect(() => {
        getProviders().then((p) => setGoogleEnabled(Boolean(p?.google)))
    }, [])

    // Already logged in as admin → go to dashboard
    useEffect(() => {
        if (session?.user && (session.user as any).role === "ADMIN") {
            router.replace(callbackUrl)
        }
    }, [session, callbackUrl, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                roleRequired: "ADMIN",
                redirect: false,
                redirectTo: callbackUrl,
            })
            if (result?.error) {
                setError("Invalid credentials. Please check your email and password.")
                setLoading(false)
                return
            }
            router.push(result?.url || callbackUrl)
        } catch {
            setError("Something went wrong. Please try again.")
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setError("")
        setGoogleLoading(true)
        try {
            await fetch("/api/auth/set-login-role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: "ADMIN" }),
            })
            await signIn("google", { redirectTo: callbackUrl }, { prompt: "select_account" })
        } catch (err: any) {
            setError(err.message || "Unable to start Google sign-in. Please try again.")
            setGoogleLoading(false)
        }
    }

    const authError = searchParams.get("error")
    const errorMessage = error ||
        (authError ? "Sign-in could not be completed. Please check your credentials and try again." : "")

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-6">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.15),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.1),transparent_60%)]" />
                {/* Grid */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
            </div>

            <div className="absolute top-1/4 -left-32 h-80 w-80 animate-pulse rounded-full bg-indigo-600/20 blur-[120px]" />
            <div className="absolute bottom-1/4 -right-32 h-80 w-80 animate-pulse rounded-full bg-violet-600/15 blur-[120px] delay-1000" />

            <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-700">
                {/* Header */}
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-xl">
                            <BrandLogo href="/" variant="light" size="md" />
                        </div>
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-indigo-400" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Admin Portal</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">Admin Sign In</h1>
                    <p className="mt-2 font-medium text-slate-400">Access the RideWay management dashboard</p>
                </div>

                {/* Card */}
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 pt-10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
                    {errorMessage && (
                        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-400 animate-in slide-in-from-top-2">
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="admin-email" className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Email Address
                            </Label>
                            <Input
                                id="admin-email"
                                type="email"
                                placeholder="admin@example.com"
                                className="h-12 rounded-xl border-white/10 bg-white/5 font-medium text-white placeholder:text-slate-600 transition-all focus:border-indigo-500/50 focus:ring-indigo-500/30"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <Label htmlFor="admin-password" className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Password
                                </Label>
                                <Link href="/forgot-password" className="text-[11px] font-black uppercase tracking-wider text-indigo-400 hover:text-indigo-300">
                                    Forgot?
                                </Link>
                            </div>
                            <Input
                                id="admin-password"
                                type="password"
                                placeholder="Password"
                                className="h-12 rounded-xl border-white/10 bg-white/5 font-medium text-white placeholder:text-slate-600 transition-all focus:border-indigo-500/50 focus:ring-indigo-500/30"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <Button
                            type="submit"
                            id="admin-signin-btn"
                            className="h-14 w-full rounded-2xl bg-indigo-600 text-lg font-black text-white shadow-lg shadow-indigo-900/50 transition-all hover:bg-indigo-500 active:scale-95"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <>Sign In <ArrowRight className="ml-2 h-5 w-5" /></>
                            )}
                        </Button>

                        {googleEnabled && (
                            <>
                                <div className="relative flex items-center gap-4 py-2">
                                    <div className="h-px flex-1 bg-white/10" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">or</span>
                                    <div className="h-px flex-1 bg-white/10" />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    id="admin-google-btn"
                                    className="h-12 w-full rounded-xl border border-white/10 bg-white/5 font-bold text-slate-300 transition-all hover:bg-white/10"
                                    disabled={googleLoading}
                                    onClick={handleGoogleSignIn}
                                >
                                    {googleLoading ? (
                                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                    ) : (
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="mr-3 h-5 w-5" alt="Google" />
                                    )}
                                    Continue with Google
                                </Button>
                            </>
                        )}
                    </form>

                    <p className="mt-8 text-center text-sm font-bold text-slate-600">
                        Not an admin?{" "}
                        <Link href="/login" className="text-indigo-400 transition-colors hover:text-indigo-300">
                            Regular sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-950"><Loader2 className="h-10 w-10 animate-spin text-indigo-500" /></div>}>
            <AdminLoginContent />
        </Suspense>
    )
}
