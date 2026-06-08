
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Bus, ShieldCheck, User, Loader2 } from "lucide-react"

const roleConfigs = {
  TRAVELLER: {
    label: "Traveller",
    icon: <User className="h-6 w-6" />,
    bg: "/traveller-bg.jpg",
    accent: "blue",
    title: "Join as a Traveller",
    desc: "Book tickets, track buses and travel with ease."
  },
  DRIVER: {
    label: "Driver",
    icon: <Bus className="h-6 w-6" />,
    bg: "/driver-bg.jpg",
    accent: "emerald",
    title: "Join as a Driver",
    desc: "Manage your trips, scan tickets and earn more."
  },
  ADMIN: {
    label: "Admin",
    icon: <ShieldCheck className="h-6 w-6" />,
    bg: "/admin-bg.jpg",
    accent: "slate",
    title: "Join as an Admin",
    desc: "Manage the fleet, routes and system settings."
  }
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
    role: "TRAVELLER" as keyof typeof roleConfigs,
    licenseNumber: "",
    acceptTerms: false,
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

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

    if (formData.role === "DRIVER" && !formData.licenseNumber) {
      setError("License number is required for drivers")
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
          role: formData.role,
          licenseNumber: formData.role === "DRIVER" ? formData.licenseNumber : undefined,
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

  const currentRole = roleConfigs[formData.role]

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">
      {/* Left Side: Dynamic Background & Branding */}
      <div className="lg:w-1/2 relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden">
        {/* Background Images Layer */}
        {Object.entries(roleConfigs).map(([key, config]) => (
          <div
            key={key}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              formData.role === key ? "opacity-100 scale-100" : "opacity-0 scale-110"
            )}
          >
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img
              src={config.bg}
              alt={config.label}
              className="w-full h-full object-cover transition-transform duration-[10000ms] ease-linear"
              style={{ transform: formData.role === key ? 'scale(1.1)' : 'scale(1)' }}
            />
          </div>
        ))}



        <div className="relative z-20 max-w-md animate-in fade-in slide-in-from-left-8 duration-700">

          <h2 className="text-5xl font-black mb-4 leading-tight">{currentRole.title}</h2>
          <p className="text-xl text-white/80 font-medium leading-relaxed">
            {currentRole.desc}
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-20 flex justify-between items-center text-sm text-white/60 font-medium">
          <span>&copy; 2024 RideWay Inc.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-12 lg:py-20 lg:px-12">
          {/* Mobile Branding */}
          <div className="lg:hidden mb-12 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bus className="text-white h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">RideWay</span>
            </Link>
            <Link href="/login" className="text-sm font-bold text-blue-600">Sign In</Link>
          </div>

          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 mb-2">Create your account</h1>
            <p className="text-slate-500 font-medium">Choose your role and fill in the details below.</p>
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
            {/* Role Selection Tabs */}
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Account Type</Label>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(roleConfigs).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: key as keyof typeof roleConfigs })}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 group",
                      formData.role === key
                        ? "border-blue-600 bg-blue-50/50 ring-4 ring-blue-50"
                        : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg mb-2 transition-colors",
                      formData.role === key ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-white"
                    )}>
                      {config.icon}
                    </div>
                    <span className={cn(
                      "text-xs font-black uppercase tracking-tight",
                      formData.role === key ? "text-blue-600" : "text-slate-500"
                    )}>{config.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Separator className="bg-slate-50" />

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

            {formData.role === "DRIVER" && (
              <div className="space-y-3 p-6 rounded-2xl bg-emerald-50 border border-emerald-100 animate-in slide-in-from-top-2 duration-300">
                <Label htmlFor="licenseNumber" className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                  <ShieldCheck className="h-4 w-4" /> Driver's License Number
                </Label>
                <Input
                  id="licenseNumber"
                  required={formData.role === "DRIVER"}
                  className="h-12 rounded-xl border-emerald-200 bg-white focus:ring-emerald-500"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  placeholder="LP-XXXX-XXXX"
                />
              </div>
            )}

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
              onClick={() => {
                // Set a cookie or pass via callbackUrl to auth.ts
                document.cookie = `intended_role=${formData.role}; path=/; max-age=300; SameSite=Lax`
                signIn("google", { callbackUrl: "/dashboard" })
              }}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-5 h-5" alt="Google" />
              Register as {currentRole.label} with Google
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

function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px w-full", className)} />
}
