"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import BrandLogo from "@/components/shared/BrandLogo"
import GoogleSignInButton from "@/components/shared/GoogleSignInButton"

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false,
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const registered = searchParams.get("registered")

    function getCallbackUrl() {
        const cb = searchParams.get("callbackUrl")
        return cb?.startsWith("/") && !cb.startsWith("//") ? cb : "/dashboard"
    }

    function authErrorMessage() {
        const authError = searchParams.get("error")
        if (!authError) return ""
        if (authError === "OAuthRoleMismatch") {
            return "This Google account belongs to a different RideWay portal. Use the admin or driver login page."
        }
        if (authError === "OAuthEmailNotVerified") {
            return "Google did not confirm this email as verified. Use a verified Google account."
        }
        if (authError === "OAuthEmailMissing") {
            return "Google did not return an email address for this account."
        }
        return "Sign-in could not be completed. Please check your credentials and try again."
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const redirectTo = getCallbackUrl()
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                roleRequired: "TRAVELLER",
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


                    {(error || authErrorMessage()) && (
                        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-600">
                            {error || authErrorMessage()}
                        </div>
                    )}

                    <GoogleSignInButton
                        roleRequired="TRAVELLER"
                        callbackUrl={getCallbackUrl()}
                        onError={setError}
                    />

                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">or use email</span>
                        <div className="h-px flex-1 bg-slate-200" />
                    </div>

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
                                <Link href="/forgot-password" className="text-[11px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-700">
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

                    </form>

                    <p className="mt-8 text-center text-sm font-bold text-slate-500">
                        New on RideWay?{" "}
                        <Link href="/register" className="text-blue-600 transition-colors hover:text-blue-800">
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
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-900"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>}>
            <LoginContent />
        </Suspense>
    )
}
