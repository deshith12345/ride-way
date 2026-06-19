
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getProviders, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ShieldCheck, User, Loader2 } from "lucide-react"
import BrandLogo from "@/components/shared/BrandLogo"

const travellerConfig = {
  label: "Traveller",
  icon: <User className="h-6 w-6" />,
  bg: "/traveller-bg.jpg",
  title: "Join RideWay",
  desc: "Book tickets, track buses and travel with ease."
}

export default function RegisterPage() {
  const router = useRouter()
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

  useEffect(() => {
    getProviders().then((providers) => {
      setGoogleEnabled(Boolean(providers?.google))
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
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
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: "TRAVELLER",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      router.push("/login?registered=true")
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
            src={travellerConfig.bg}
            alt={travellerConfig.label}
            className="w-full h-full object-cover transition-transform duration-[10000ms] ease-linear scale-110"
          />
        </div>



        <div className="relative z-20">
          <BrandLogo href="/" variant="light" size="md" />
        </div>

        <div className="relative z-20 max-w-md animate-in fade-in slide-in-from-left-8 duration-700">

          <h2 className="text-5xl font-black mb-4 leading-tight">{travellerConfig.title}</h2>
          <p className="text-xl text-white/80 font-medium leading-relaxed">
            {travellerConfig.desc}
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
            <Link href="/login" className="text-sm font-bold text-blue-600">Sign In</Link>
          </div>

          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 mb-2">Create your account</h1>
            <p className="text-slate-500 font-medium">Create a traveller account and book your next ride.</p>
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
                  <Link href="/login" className="mt-2 inline-block text-blue-600 hover:underline">
                    Try logging in instead?
                  </Link>
                )}
              </div>
            </div>
          )}

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
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-left">
                <Label htmlFor="password" className="text-sm font-bold text-slate-700 ml-1">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  minLength={6}
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
                  placeholder="••••••••"
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
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-3 shadow-sm transition-all active:scale-95"
              disabled={!googleEnabled}
              onClick={() => signIn("google", { callbackUrl: "/dashboard" }, { prompt: "select_account" })}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-5 h-5" alt="Google" />
              {googleEnabled ? "Register with Google" : "Google registration unavailable"}
            </Button>

            <Link href="/login" className="w-full">
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
