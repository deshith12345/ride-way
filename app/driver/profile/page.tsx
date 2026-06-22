"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { ArrowLeft, BadgeCheck, Calendar, IdCard, Loader2, Mail, Phone, Save, User } from "lucide-react"
import { format } from "date-fns"
import BrandLogo from "@/components/shared/BrandLogo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

type DriverProfile = {
    id: string
    name: string | null
    email: string
    image?: string | null
    phone?: string | null
    licenseNumber?: string | null
    isVerified: boolean
    createdAt: string
}

const emptyProfile = {
    name: "",
    phone: "",
    licenseNumber: "",
}

export default function DriverProfilePage() {
    const { data: session, update } = useSession()
    const [profile, setProfile] = useState<DriverProfile | null>(null)
    const [form, setForm] = useState(emptyProfile)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    const initials = (profile?.name || profile?.email || session?.user?.name || "D")
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()

    const loadProfile = async () => {
        setLoading(true)
        setError("")

        try {
            const response = await fetch("/api/driver/profile", { cache: "no-store" })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Unable to load driver profile")

            setProfile(data)
            setForm({
                name: data.name || "",
                phone: data.phone || "",
                licenseNumber: data.licenseNumber || "",
            })
        } catch (err: any) {
            setError(err.message || "Unable to load driver profile")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadProfile()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        setError("")
        setMessage("")

        try {
            const response = await fetch("/api/driver/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Unable to update driver profile")

            setProfile(data)
            setForm({
                name: data.name || "",
                phone: data.phone || "",
                licenseNumber: data.licenseNumber || "",
            })
            await update()
            setMessage("Profile updated successfully.")
        } catch (err: any) {
            setError(err.message || "Unable to update driver profile")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10">
            <div className="container mx-auto max-w-5xl px-4">
                <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div>
                        <BrandLogo href="/driver/dashboard" size="sm" subtitle="Driver Portal" className="mb-6" />
                        <div className="flex items-center gap-3">
                            <Link href="/driver/dashboard">
                                <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-slate-900">Driver Profile</h1>
                                <p className="mt-1 text-sm font-semibold text-slate-500">Manage your driver account details.</p>
                            </div>
                        </div>
                    </div>
                    {profile && (
                        <Badge className={profile.isVerified ? "w-fit rounded-full bg-emerald-50 px-4 py-2 font-black text-emerald-700" : "w-fit rounded-full bg-amber-50 px-4 py-2 font-black text-amber-700"}>
                            <BadgeCheck className="mr-2 h-4 w-4" />
                            {profile.isVerified ? "Verified Driver" : "Pending Verification"}
                        </Badge>
                    )}
                </div>

                {loading ? (
                    <Card className="rounded-3xl border-slate-100 bg-white p-20 text-center shadow-xl shadow-slate-200/40">
                        <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />
                        <p className="mt-4 font-bold text-slate-500">Loading driver profile...</p>
                    </Card>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
                        <Card className="overflow-hidden rounded-3xl border-slate-100 bg-white shadow-xl shadow-slate-200/40">
                            <CardContent className="p-8">
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-5 flex h-28 w-28 items-center justify-center overflow-hidden rounded-[28px] border-4 border-white bg-blue-600 text-4xl font-black text-white shadow-xl shadow-blue-100">
                                        {profile?.image ? (
                                            <img src={profile.image} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            initials
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900">{profile?.name || "Driver"}</h2>
                                    <p className="mt-1 text-sm font-bold text-slate-500">{profile?.email}</p>
                                </div>

                                <div className="mt-8 space-y-3">
                                    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                                        <Mail className="h-4 w-4 text-blue-600" />
                                        <span className="truncate text-sm font-bold text-slate-700">{profile?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                                        <Phone className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-bold text-slate-700">{profile?.phone || "Phone not added"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                                        <IdCard className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-bold text-slate-700">{profile?.licenseNumber || "License not added"}</span>
                                    </div>
                                    {profile?.createdAt && (
                                        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-bold text-slate-700">Joined {format(new Date(profile.createdAt), "MMM dd, yyyy")}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden rounded-3xl border-slate-100 bg-white shadow-xl shadow-slate-200/40">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/70 p-6">
                                <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-900">
                                    <User className="h-5 w-5 text-blue-600" />
                                    Edit Profile
                                </CardTitle>
                                <CardDescription>Update your personal details for assigned trips and support records.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5 p-6">
                                {error && (
                                    <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                                        {error}
                                    </div>
                                )}
                                {message && (
                                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                                        {message}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="font-black uppercase tracking-widest text-slate-500">Full Name</Label>
                                    <Input
                                        value={form.name}
                                        onChange={(event) => setForm({ ...form, name: event.target.value })}
                                        className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-bold"
                                        placeholder="Driver full name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-black uppercase tracking-widest text-slate-500">Phone Number</Label>
                                    <Input
                                        value={form.phone}
                                        onChange={(event) => setForm({ ...form, phone: event.target.value })}
                                        className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-bold"
                                        placeholder="+94 77 123 4567"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-black uppercase tracking-widest text-slate-500">License Number</Label>
                                    <Input
                                        value={form.licenseNumber}
                                        onChange={(event) => setForm({ ...form, licenseNumber: event.target.value })}
                                        className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-bold"
                                        placeholder="Driver license number"
                                    />
                                </div>

                                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold leading-6 text-blue-800">
                                    Email address and verification status are protected. Admins manage those details from the admin portal.
                                </div>

                                <Button
                                    onClick={handleSave}
                                    disabled={saving || !form.name.trim()}
                                    className="h-14 w-full rounded-2xl bg-blue-600 text-base font-black text-white hover:bg-blue-700"
                                >
                                    {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                    Save Driver Profile
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
