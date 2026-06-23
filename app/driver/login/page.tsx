"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Loader2, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import BrandLogo from "@/components/shared/BrandLogo"

function DriverLoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session } = useSession()
    const [formData, setFormData] = useState({ email: "", password: "" })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const callbackUrl = (() => {
        const cb = searchParams.get("callbackUrl")
        return cb?.startsWith("/") && !cb.startsWith("//") ? cb : "/driver/dashboard"
    })()

    const switchAccount = searchParams.get("switchAccount") === "1"

    // Already logged in as driver and NOT switching → go to dashboard
    useEffect(() => {
        if (!switchAccount && session?.user && (session.user as any).role === "DRIVER") {
            router.replace(callbackUrl)
        }
    }, [session, callbackUrl, router, switchAccount])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                roleRequired: "DRIVER",
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

    const authError = searchParams.get("error")
    const errorMessage = error ||
        (authError ? "Sign-in could not be completed. Please check your credentials and try again." : "")

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 p-6">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/driver-bg.jpg"
                    className="h-full w-full scale-105 object-cover blur-[2px]"
                    alt="RideWay driver background"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-brightness-75" />
            </div>

            {/* Pulses */}
            <div className="absolute top-1/4 -left-1/4 h-96 w-96 animate-pulse rounded-full bg-emerald-500/20 blur-[100px]" />
            <div className="absolute right-[-25%] bottom-1/4 h-96 w-96 animate-pulse rounded-full bg-teal-500/20 blur-[100px] delay-700" />

            <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-700">
                {/* Header */}
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="mb-4 rounded-2xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-xl">
                        <BrandLogo href="/" variant="light" size="md" />
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                        <Truck className="h-5 w-5 text-emerald-400" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Driver Portal</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">Driver Sign In</h1>
                    <p className="mt-2 font-medium text-emerald-100">Access your trips, schedules and ticket scanner</p>
                </div>

                {/* Card */}
                <div className="rounded-3xl border border-white/40 bg-white/80 p-8 pt-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
                    {errorMessage && (
                        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-600 animate-in slide-in-from-top-2">
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="driver-email" className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                Email Address
                            </Label>
                            <Input
                                id="driver-email"
                                type="email"
                                placeholder="driver@example.com"
                                className="h-12 rounded-xl border-white/50 bg-white/50 font-medium text-slate-900 transition-all focus:ring-emerald-500"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <Label htmlFor="driver-password" className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                    Password
                                </Label>
                                <Link href="/forgot-password" className="text-[11px] font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-700">
                                    Forgot?
                                </Link>
                            </div>
                            <Input
                                id="driver-password"
                                type="password"
                                placeholder="Password"
                                className="h-12 rounded-xl border-white/50 bg-white/50 font-medium text-slate-900 transition-all focus:ring-emerald-500"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <Button
                            type="submit"
                            id="driver-signin-btn"
                            className="h-14 w-full rounded-2xl bg-emerald-600 text-lg font-black text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <>Sign In <ArrowRight className="ml-2 h-5 w-5" /></>
                            )}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm font-bold text-slate-500">
                        Not a driver?{" "}
                        <Link href="/login" className="text-emerald-600 transition-colors hover:text-emerald-800">
                            Regular sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function DriverLoginPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-900"><Loader2 className="h-10 w-10 animate-spin text-emerald-600" /></div>}>
            <DriverLoginContent />
        </Suspense>
    )
}
