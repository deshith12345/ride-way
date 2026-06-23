"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import BrandLogo from "@/components/shared/BrandLogo"
import GoogleSignInButton from "@/components/shared/GoogleSignInButton"

function authErrorMessage(code: string | null) {
    if (!code) return ""
    if (code === "OAuthRoleMismatch") return "That Google account belongs to another RideWay sign-in area. Use an admin account to continue."
    if (code === "OAuthPortalSignupRestricted") return "Admin Google sign-up is limited to approved RideWay email addresses."
    if (code === "OAuthEmailNotVerified") return "Google did not confirm this email as verified. Use a verified Google account."
    if (code === "OAuthEmailMissing") return "Google did not return an email address for this account."
    return "Sign-in could not be completed. Please check your credentials and try again."
}

function AdminLoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session } = useSession()
    const [formData, setFormData] = useState({ email: "", password: "" })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const callbackUrl = (() => {
        const cb = searchParams.get("callbackUrl")
        return cb?.startsWith("/") && !cb.startsWith("//") ? cb : "/admin/dashboard"
    })()
    const forgotHref = `/forgot-password?${new URLSearchParams({
        roleRequired: "ADMIN",
        callbackUrl,
    }).toString()}`
    const registerHref = `/register?${new URLSearchParams({
        roleRequired: "ADMIN",
        callbackUrl,
    }).toString()}`
    const switchAccount = searchParams.get("switchAccount") === "1"

    useEffect(() => {
        if (!switchAccount && session?.user && (session.user as any).role === "ADMIN") {
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
                roleRequired: "ADMIN",
                redirect: false,
                redirectTo: callbackUrl,
            })
            if (result?.error) {
                setError("Invalid admin credentials. Check your email and password.")
                setLoading(false)
                return
            }
            router.push(result?.url || callbackUrl)
        } catch {
            setError("Something went wrong. Please try again.")
            setLoading(false)
        }
    }

    const errorMessage = error || authErrorMessage(searchParams.get("error"))

    return (
        <div className="flex min-h-screen flex-col overflow-hidden bg-white lg:flex-row">
            <section className="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex lg:w-1/2">
                <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
                    <div className="absolute inset-0 z-10 bg-black/45" />
                    <img
                        src="/admin-bg.jpg"
                        alt="RideWay admin operations"
                        className="h-full w-full scale-110 object-cover transition-transform duration-[10000ms] ease-linear"
                    />
                </div>

                <div className="relative z-20">
                    <BrandLogo href="/" variant="light" size="md" />
                </div>

                <div className="relative z-20 max-w-md animate-in fade-in slide-in-from-left-8 duration-700">
                    <h2 className="mb-4 text-5xl font-black leading-tight">Manage RideWay with secure access</h2>
                    <p className="text-xl font-medium leading-relaxed text-white/80">
                        Control buses, routes, schedules, users, and support from the dedicated admin workspace.
                    </p>
                </div>

                <div className="relative z-20 flex items-center justify-between text-sm font-medium text-white/60">
                    <span>&copy; 2024 RideWay Inc.</span>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link>
                        <Link href="/terms" className="transition-colors hover:text-white">Terms</Link>
                    </div>
                </div>
            </section>

            <section className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-xl px-6 py-12 lg:px-12 lg:py-20">
                    <div className="mb-12 lg:hidden">
                        <BrandLogo href="/" size="sm" />
                    </div>

                    <div className="mb-10">
                        <h1 className="mb-2 text-4xl font-black text-slate-900">Sign in to admin</h1>
                        <p className="font-medium text-slate-500">Use an approved admin account. Traveller and driver sessions stay separate from this sign-in.</p>
                    </div>

                    {errorMessage && (
                        <div className="mb-8 flex items-start gap-4 rounded-3xl border border-rose-100 bg-rose-50 p-5 text-sm font-bold text-rose-700 shadow-sm shadow-rose-100">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div className="flex-1 pt-1">
                                <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-rose-900">Sign-in Error</p>
                                <p className="leading-tight text-rose-600">{errorMessage}</p>
                            </div>
                        </div>
                    )}

                    <GoogleSignInButton
                        roleRequired="ADMIN"
                        callbackUrl={callbackUrl}
                        label="Continue with Google"
                        onError={setError}
                    />

                    <div className="my-8 flex items-center gap-3">
                        <span className="h-px flex-1 bg-slate-100" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">or use email</span>
                        <span className="h-px flex-1 bg-slate-100" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-2 text-left">
                            <Label htmlFor="admin-email" className="ml-1 text-sm font-bold text-slate-700">Email Address</Label>
                            <Input
                                id="admin-email"
                                type="email"
                                placeholder="admin@example.com"
                                required
                                className="h-12 rounded-xl border-slate-200 focus:ring-blue-500"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2 text-left">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="admin-password" className="ml-1 text-sm font-bold text-slate-700">Password</Label>
                                <Link href={forgotHref} className="text-xs font-black uppercase tracking-wider text-blue-600 hover:text-blue-700">
                                    Forgot?
                                </Link>
                            </div>
                            <Input
                                id="admin-password"
                                type="password"
                                placeholder="Password"
                                required
                                className="h-12 rounded-xl border-slate-200 focus:ring-blue-500"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <Button
                            type="submit"
                            id="admin-signin-btn"
                            className="h-14 w-full rounded-2xl bg-blue-600 text-lg font-bold text-white transition-all hover:bg-blue-700 hover:shadow-2xl disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mx-auto h-6 w-6 animate-spin" /> : <>Sign In <ArrowRight className="h-5 w-5" /></>}
                        </Button>
                    </form>

                    <p className="mt-12 flex items-center justify-center gap-4 text-center text-sm font-bold uppercase tracking-widest text-slate-400">
                        <span className="h-px w-12 bg-slate-100" />
                        Admin access
                        <span className="h-px w-12 bg-slate-100" />
                    </p>

                    <div className="mt-6 flex flex-col items-center gap-4">
                        <Link href={registerHref} className="w-full">
                            <Button variant="outline" className="h-12 w-full rounded-xl border-slate-200 px-8 font-bold text-slate-600 transition-all hover:bg-slate-50">
                                Request access with Google
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-white"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>}>
            <AdminLoginContent />
        </Suspense>
    )
}
