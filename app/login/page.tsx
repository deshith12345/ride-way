"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { getProviders, signIn, signOut, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import BrandLogo from "@/components/shared/BrandLogo"

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session, status } = useSession()
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false,
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [googleEnabled, setGoogleEnabled] = useState(false)

    const registered = searchParams.get("registered")
    const roleRequired = searchParams.get("roleRequired")
    const requiredRole = roleRequired?.toUpperCase()
    const isStaffLogin = requiredRole === "ADMIN" || requiredRole === "DRIVER"
    const staffRegisterHref = isStaffLogin
        ? `/register?${new URLSearchParams({
            roleRequired: requiredRole,
            callbackUrl: getRequestedCallbackUrl() || (requiredRole === "ADMIN" ? "/admin/dashboard" : "/driver/dashboard"),
        }).toString()}`
        : "/register"
    const forgotPasswordHref = isStaffLogin
        ? `/forgot-password?${new URLSearchParams({
            roleRequired: requiredRole,
            callbackUrl: getRequestedCallbackUrl() || (requiredRole === "ADMIN" ? "/admin/dashboard" : "/driver/dashboard"),
        }).toString()}`
        : "/forgot-password"
    const currentRole = session?.user?.role?.toUpperCase()
    const shouldSwitchAccount =
        searchParams.get("switchAccount") === "1" &&
        status === "authenticated" &&
        Boolean(requiredRole) &&
        currentRole !== requiredRole

    function getRequestedCallbackUrl() {
        const callbackUrl = searchParams.get("callbackUrl")
        if (!callbackUrl?.startsWith("/") || callbackUrl.startsWith("//")) return null
        return callbackUrl
    }

    function getGoogleIntent(redirectTo: string) {
        if (requiredRole === "ADMIN" || requiredRole === "DRIVER" || requiredRole === "TRAVELLER") {
            return { role: requiredRole, strictRole: true }
        }
        if (redirectTo.startsWith("/admin")) return { role: "ADMIN", strictRole: true }
        if (redirectTo.startsWith("/driver")) return { role: "DRIVER", strictRole: true }
        return { role: "TRAVELLER", strictRole: false }
    }

    function authErrorMessage() {
        const authError = searchParams.get("error")
        if (!authError) return ""

        if (
            authError === "GoogleRoleMismatch" ||
            authError === "GoogleRoleMissing" ||
            authError === "GoogleSignInFailed" ||
            authError === "AccessDenied" ||
            authError === "OAuthAccountNotLinked"
        ) {
            return "Sign-in could not be completed. Check that you are using the correct RideWay portal and try again."
        }
        if (authError === "GoogleEmailUnverified" || authError === "GoogleEmailMissing") {
            return "Google sign-in could not verify the account details. Try another sign-in method."
        }
        return ""
    }

    useEffect(() => {
        getProviders().then((providers) => {
            setGoogleEnabled(Boolean(providers?.google))
        })
    }, [])

    useEffect(() => {
        if (!shouldSwitchAccount || !requiredRole) return

        const requestedCallbackUrl = searchParams.get("callbackUrl")
        const callbackUrl =
            requestedCallbackUrl?.startsWith("/") && !requestedCallbackUrl.startsWith("//")
                ? requestedCallbackUrl
                : "/dashboard"
        const params = new URLSearchParams({
            callbackUrl,
            roleRequired: requiredRole,
        })

        signOut({ redirectTo: `/login?${params.toString()}` })
    }, [searchParams, shouldSwitchAccount, requiredRole])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const redirectTo = getRequestedCallbackUrl() || "/dashboard"
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                roleRequired: requiredRole || "",
                redirect: false,
                redirectTo,
            })

            if (result?.error) {
                setError("Sign-in could not be completed. Check your details and try again.")
                setLoading(false)
                return
            }

            router.push(result?.url || redirectTo)
        } catch {
            setError("Something went wrong. Please try again.")
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setError("")
        setGoogleLoading(true)

        try {
            const redirectTo =
            getRequestedCallbackUrl() ||
            (requiredRole === "ADMIN"
                ? "/admin/dashboard"
                : requiredRole === "DRIVER"
                ? "/driver/dashboard"
                : "/dashboard")
            const googleIntent = getGoogleIntent(redirectTo)
            const response = await fetch("/api/auth/google-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roleRequired: googleIntent.role,
                    callbackUrl: redirectTo,
                    strictRole: googleIntent.strictRole,
                }),
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.error || "Unable to start Google sign-in.")
            }

            await signIn(
                "google",
                { redirectTo },
                { prompt: "select_account" }
            )
        } catch (err: any) {
            setError(err.message || "Unable to start Google sign-in.")
            setGoogleLoading(false)
        }
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 p-6">
            <div className="absolute inset-0 z-0">
                <img
                    src="/register-bg.jpg"
                    className="h-full w-full scale-105 object-cover blur-[2px]"
                    alt="RideWay bus route background"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-brightness-75" />
            </div>

            <div className="absolute top-1/4 -left-1/4 h-96 w-96 animate-pulse rounded-full bg-blue-500/20 blur-[100px]" />
            <div className="absolute right-[-25%] bottom-1/4 h-96 w-96 animate-pulse rounded-full bg-indigo-500/20 blur-[100px] delay-700" />

            <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-700">
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="mb-4 rounded-2xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-xl">
                        <BrandLogo href="/" variant="light" size="md" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">Welcome Back</h1>
                    <p className="mt-2 font-medium text-blue-100">Sign in to your RideWay account</p>
                </div>

                <div className="rounded-3xl border border-white/40 bg-white/80 p-8 pt-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
                    {registered && (
                        <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-600 animate-in slide-in-from-top-2">
                            Registration complete. You can now sign in.
                        </div>
                    )}

                    {roleRequired && (
                        <div className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm font-bold text-blue-700">
                            Please sign in with a {roleRequired.toUpperCase()} account to continue.
                        </div>
                    )}

                    {(error || authErrorMessage()) && (
                        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-600">
                            {error || authErrorMessage()}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                className="h-12 rounded-xl border-white/50 bg-white/50 font-medium text-slate-900 transition-all focus:ring-blue-500"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                    Password
                                </Label>
                                <Link href={forgotPasswordHref} className="text-[11px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-700">
                                    Forgot?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Password"
                                className="h-12 rounded-xl border-white/50 bg-white/50 font-medium text-slate-900 transition-all focus:ring-blue-500"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div className="ml-1 flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                className="border-slate-300 data-[state=checked]:bg-blue-600"
                                checked={formData.remember}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, remember: checked as boolean })
                                }
                            />
                            <label htmlFor="remember" className="cursor-pointer select-none text-sm font-bold text-slate-500">
                                Keep me signed in
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="h-14 w-full rounded-2xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <>Sign In <ArrowRight className="ml-2 h-5 w-5" /></>
                            )}
                        </Button>

                        <div className="relative flex items-center gap-4 py-2">
                            <div className="h-px flex-1 bg-slate-200" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">or</span>
                            <div className="h-px flex-1 bg-slate-200" />
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="h-12 w-full rounded-xl border border-white/50 bg-white/20 font-bold text-slate-600 shadow-sm transition-all hover:bg-white/40"
                            disabled={!googleEnabled || googleLoading}
                            onClick={handleGoogleSignIn}
                        >
                            {googleLoading ? (
                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            ) : (
                                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="mr-3 h-5 w-5" alt="Google" />
                            )}
                            {googleEnabled ? "Continue with Google" : "Google sign-in unavailable"}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm font-bold text-slate-500">
                        New on RideWay?{" "}
                        <Link href={staffRegisterHref} className="text-blue-600 transition-colors hover:text-blue-800">
                            Create {isStaffLogin ? `${requiredRole === "ADMIN" ? "Admin" : "Driver"} Account` : "Account"}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-900"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>}>
            <LoginContent />
        </Suspense>
    )
}
