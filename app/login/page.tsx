
"use client"

import { useState } from "react"
import { getProviders, signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Loader2, ArrowRight } from "lucide-react"
import { Suspense } from "react"
import { useEffect } from "react"
import { getPortalUrl } from "@/lib/portal"

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    // ... rest of state and handlers ...
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false,
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [googleEnabled, setGoogleEnabled] = useState(false)

    const registered = searchParams.get("registered")

    function getSafeCallbackUrl(role?: string | null) {
        const callbackUrl = searchParams.get("callbackUrl")
        if (!callbackUrl?.startsWith("/") || callbackUrl.startsWith("//")) return null

        const normalizedRole = role?.toUpperCase()
        if (callbackUrl.startsWith("/admin") && normalizedRole !== "ADMIN") return null
        if (callbackUrl.startsWith("/driver") && normalizedRole !== "DRIVER") return null

        return callbackUrl
    }

    useEffect(() => {
        getProviders().then((providers) => {
            setGoogleEnabled(Boolean(providers?.google))
        })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            })

            if (result?.error) {
                setError("Oops! Invalid email or password")
                setLoading(false)
                return
            }

            // Get the updated session to check the role
            const { getSession } = await import("next-auth/react")
            const session = await getSession()
            const role = session?.user?.role?.toUpperCase()

            router.refresh()

            const safeCallbackUrl = getSafeCallbackUrl(role)
            if (safeCallbackUrl) {
                router.push(safeCallbackUrl)
            } else {
                window.location.href = getPortalUrl(role, window.location.href).toString()
            }
        } catch (err) {
            setError("Something went wrong. Please try again.")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center p-6 bg-slate-900 overflow-hidden">
            {/* Background Image Logic */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/register-bg.jpg"
                    className="w-full h-full object-cover blur-[2px] scale-105"
                    alt="Background"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-brightness-75" />
            </div>

            {/* Liquid Glow Effects */}
            <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse delay-700" />

            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
                {/* Branding */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 mb-4 shadow-2xl">
                        <img src="/logo.png" alt="RideWay" className="h-10 w-auto invert brightness-0" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">Welcome Back</h1>
                    <p className="text-blue-100 font-medium mt-2">Sign in to your RideWay account</p>
                </div>

                {/* Liquid Glass Card */}
                <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/40 p-8 pt-10">

                    {registered && (
                        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl text-sm font-bold animate-in slide-in-from-top-2">
                            ✨ Registration complete! You can now sign in.
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl text-sm font-bold">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-600 font-bold ml-1 uppercase text-[11px] tracking-wider">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                className="bg-white/50 border-white/50 h-12 rounded-xl focus:ring-blue-500 transition-all font-medium text-slate-900"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <Label htmlFor="password" className="text-slate-600 font-bold uppercase text-[11px] tracking-wider">Password</Label>
                                <Link href="/forgot-password" className="text-[11px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-wider">
                                    Forgot?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="bg-white/50 border-white/50 h-12 rounded-xl focus:ring-blue-500 transition-all font-medium text-slate-900"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center space-x-2 ml-1">
                            <Checkbox
                                id="remember"
                                className="border-slate-300 data-[state=checked]:bg-blue-600"
                                checked={formData.remember}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, remember: checked as boolean })
                                }
                            />
                            <label htmlFor="remember" className="text-sm text-slate-500 font-bold select-none cursor-pointer">
                                Keep me signed in
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl text-lg font-black shadow-lg shadow-blue-200 transition-all active:scale-95 text-white"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <>Sign In <ArrowRight className="ml-2 h-5 w-5" /></>
                            )}
                        </Button>

                        <div className="relative flex items-center gap-4 py-2">
                            <div className="h-[1px] bg-slate-200 flex-1" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">or</span>
                            <div className="h-[1px] bg-slate-200 flex-1" />
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-12 rounded-xl border-white/50 bg-white/20 hover:bg-white/40 text-slate-600 font-bold transition-all border shadow-sm"
                            disabled={!googleEnabled}
                            onClick={() => signIn("google", { callbackUrl: getSafeCallbackUrl("TRAVELLER") || "/dashboard" })}
                        >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-5 h-5 mr-3" alt="Google" />
                            {googleEnabled ? "Continue with Google" : "Google sign-in unavailable"}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-slate-500 font-bold mt-8">
                        New on RideWay?{" "}
                        <Link href="/register" className="text-blue-600 hover:text-blue-800 transition-colors">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>}>
            <LoginContent />
        </Suspense>
    )
}
