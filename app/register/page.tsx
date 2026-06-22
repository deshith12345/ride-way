
"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getProviders, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { ShieldCheck, Loader2 } from "lucide-react"
import BrandLogo from "@/components/shared/BrandLogo"
import { normalizeRole, type AppRole } from "@/lib/authz"
import { isValidEmailAddress, normalizeSriLankanMobile, sriLankanMobileHelpText } from "@/lib/validation"

const roleConfigs: Record<AppRole, {
  label: string
  bg: string
  title: string
  desc: string
  formDescription: string
}> = {
  ADMIN: {
    label: "Admin",
    bg: "/admin-bg.jpg",
    title: "Create Admin Access",
    desc: "Manage routes, buses, schedules, users, and support from RideWay.",
    formDescription: "Create an admin account for the RideWay management portal.",
  },
  DRIVER: {
    label: "Driver",
    bg: "/driver-bg.jpg",
    title: "Create Driver Access",
    desc: "View assigned trips, scan tickets, and manage your driving schedule.",
    formDescription: "Create a driver account for assigned trips and ticket scanning.",
  },
  TRAVELLER: {
    label: "Traveller",
    bg: "/traveller-bg.jpg",
    title: "Join RideWay",
    desc: "Book tickets, track buses and travel with ease.",
    formDescription: "Create a traveller account and book your next ride.",
  },
}

function safeCallbackUrl(value: string | null, role: AppRole) {
  if (value?.startsWith("/") && !value.startsWith("//")) return value
  if (role === "ADMIN") return "/admin/dashboard"
  if (role === "DRIVER") return "/driver/dashboard"
  return "/dashboard"
}

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = normalizeRole(searchParams.get("roleRequired")) || "TRAVELLER"
  const roleConfig = roleConfigs[role]
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"), role)
  const loginHref =
    role === "TRAVELLER"
      ? "/login"
      : `/login?${new URLSearchParams({
        callbackUrl,
        roleRequired: role,
      }).toString()}`
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    acceptTerms: false,
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleEnabled, setGoogleEnabled] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    getProviders().then((providers) => {
      setGoogleEnabled(Boolean(providers?.google))
    })
  }, [])

  const handleGoogleSignup = async () => {
    setError("")
    setGoogleLoading(true)
    try {
      await signIn("google", { redirectTo: callbackUrl }, { prompt: "select_account" })
    } catch (err: any) {
      setError(err.message || "Unable to start Google sign-up. Please try again.")
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!isValidEmailAddress(formData.email)) {
      setError("Enter a valid email address.")
      return
    }

    const normalizedPhone = normalizeSriLankanMobile(formData.phone)
    if (!normalizedPhone) {
      setError(sriLankanMobileHelpText)
      return
    }

    if (!formData.acceptTerms) {
      setError("Please accept the terms and conditions")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phone: normalizedPhone,
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const detail = Array.isArray(data.details) && data.details[0]?.message ? data.details[0].message : ""
        throw new Error(detail || data.error || "Registration failed")
      }

      await signOut({ redirect: false })
      const loginParams = new URLSearchParams({
        registered: "true",
        callbackUrl,
      })
      if (role !== "TRAVELLER") loginParams.set("roleRequired", role)
      router.push(`/login?${loginParams.toString()}`)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

    return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">
      {/* Left Side: Dynamic Background & Branding */}
      <div className="lg:w-1/2 relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden">
        {/* Background Images Layer */}
        <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img
            src={roleConfig.bg}
            alt={roleConfig.label}
            className="w-full h-full object-cover transition-transform duration-[10000ms] ease-linear scale-110"
          />
        </div>



        <div className="relative z-20">
          <BrandLogo href="/" variant="light" size="md" />
        </div>

        <div className="relative z-20 max-w-md animate-in fade-in slide-in-from-left-8 duration-700">

          <h2 className="text-5xl font-black mb-4 leading-tight">{roleConfig.title}</h2>
          <p className="text-xl text-white/80 font-medium leading-relaxed">
            {roleConfig.desc}
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-20 flex justify-between items-center text-sm text-white/60 font-medium">
          <span>&copy; 2024 RideWay Inc.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-12 lg:py-20 lg:px-12">
          {/* Mobile Branding */}
          <div className="lg:hidden mb-12 flex justify-between items-center">
            <BrandLogo href="/" size="sm" />
            <Link href={loginHref} className="text-sm font-bold text-blue-600">Sign In</Link>
          </div>

          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 mb-2">Create your account</h1>
            <p className="text-slate-500 font-medium">{roleConfig.formDescription}</p>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-rose-50 border border-rose-100 text-rose-700 rounded-3xl text-sm font-bold flex items-start gap-4 animate-in slide-in-from-top-2 duration-300 shadow-sm shadow-rose-100">
              <div className="h-10 w-10 shrink-0 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-rose-900 font-black uppercase text-[10px] tracking-wider mb-1">Registration Error</p>
                <p className="text-rose-600 leading-tight">{error}</p>
                {error.includes("email") && (
                  <Link href={loginHref} className="mt-2 inline-block text-blue-600 hover:underline">
                    Try logging in instead?
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className="mb-8 space-y-5">
            <Button
              type="button"
              variant="outline"
              className="h-14 w-full rounded-2xl border-slate-200 bg-white font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
              disabled={!googleEnabled || googleLoading}
              onClick={handleGoogleSignup}
            >
              {googleLoading ? (
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              ) : (
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="mr-3 h-5 w-5" alt="Google" />
              )}
              {googleEnabled ? `Sign up as ${roleConfig.label} with Google` : "Google signup unavailable"}
            </Button>

            <div className="relative flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">or use email</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-left">
                <Label htmlFor="firstName" className="text-sm font-bold text-slate-700 ml-1">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  required
                  className="h-12 rounded-xl border-slate-200 focus:ring-blue-500"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="lastName" className="text-sm font-bold text-slate-700 ml-1">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  required
                  className="h-12 rounded-xl border-slate-200 focus:ring-blue-500"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <Label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                required
                className="h-12 rounded-xl border-slate-200 focus:ring-blue-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2 text-left">
              <Label htmlFor="phone" className="text-sm font-bold text-slate-700 ml-1">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+94 XX XXX XXXX"
                required
                className="h-12 rounded-xl border-slate-200 focus:ring-blue-500"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                onBlur={() => {
                  const normalizedPhone = normalizeSriLankanMobile(formData.phone)
                  if (normalizedPhone) setFormData({ ...formData, phone: normalizedPhone })
                }}
              />
              <p className="ml-1 text-xs font-semibold text-slate-400">Sri Lankan mobile only. Example: +94 77 123 4567</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-left">
                <Label htmlFor="password" className="text-sm font-bold text-slate-700 ml-1">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="At least 8 characters"
                  minLength={8}
                  className="h-12 rounded-xl border-slate-200 focus:ring-blue-500"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="confirmPassword" className="text-sm font-bold text-slate-700 ml-1">Confirm</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="Repeat password"
                  className="h-12 rounded-xl border-slate-200 focus:ring-blue-500"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-1">
              <Checkbox
                id="terms"
                className="h-5 w-5 rounded-md border-slate-200 data-[state=checked]:bg-blue-600"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, acceptTerms: checked as boolean })
                }
              />
              <label htmlFor="terms" className="text-sm text-slate-500 font-medium cursor-pointer">
                I agree to the <span className="text-blue-600 font-bold hover:underline">Terms of Service</span> and <span className="text-blue-600 font-bold hover:underline">Privacy Policy</span>.
              </label>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full gradient-primary text-white h-14 text-lg font-bold rounded-2xl hover:shadow-2xl transition-all disabled:opacity-50"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : "Complete Registration"}
              </Button>
            </div>
          </form>

          <p className="text-center text-sm font-bold text-slate-400 mt-12 uppercase tracking-widest flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-slate-100"></span>
            Already a member?
            <span className="h-px w-12 bg-slate-100"></span>
          </p>

          <div className="mt-6 flex flex-col items-center gap-4">
            <Link href={loginHref} className="w-full">
              <Button variant="outline" className="w-full px-8 h-12 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all">
                Sign in to your account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-white"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>}>
      <RegisterContent />
    </Suspense>
  )
}
