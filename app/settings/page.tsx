"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trash2, ShieldAlert, User, Mail, Calendar, Loader2 } from "lucide-react"

import dynamic from "next/dynamic"

function SettingsPage() {
    const { data: session, status, update } = useSession()
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [editName, setEditName] = useState("")

    if (status === "unauthenticated") {
        router.push("/login")
        return null
    }

    if (status === "loading") {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    const user = session?.user

    const handleSaveProfile = async () => {
        setIsSaving(true)
        try {
            const res = await fetch("/api/user", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName }),
            })
            if (res.ok) {
                await update({ name: editName })
                setIsEditing(false)
            } else {
                const data = await res.json()
                setError(data.error || "Failed to update profile")
            }
        } catch (err) {
            setError("Failed to update profile")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteAccount = async () => {
        setIsDeleting(true)
        setError(null)

        try {
            const response = await fetch("/api/user", {
                method: "DELETE",
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Failed to delete account")
            }

            // Successfully deleted, sign out and redirect to home
            await signOut({ callbackUrl: "/" })
        } catch (err: any) {
            setError(err.message)
            setIsDeleting(false)
        }
    }

    return (
        <div className="container mx-auto max-w-4xl py-12 px-4">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Account Settings</h1>
                <p className="text-slate-500 mt-2 font-medium">Manage your personal information and account preferences.</p>
            </div>

            <div className="grid gap-8">
                {/* Profile Information */}
                <Card className="soft-shadow border-slate-100 overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold text-slate-900">Profile Information</CardTitle>
                                <CardDescription>Your public profile details</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="h-24 w-24 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-200 shrink-0">
                                {user?.image ? (
                                    <img src={user.image} alt="" className="h-full w-full object-cover rounded-3xl" />
                                ) : (
                                    user?.name?.[0] || user?.email?.[0]?.toUpperCase()
                                )}
                            </div>
                            <div className="flex-1 space-y-6 w-full">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <User className="h-3 w-3" /> Full Name
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="h-12 rounded-xl font-bold"
                                                placeholder="Your name"
                                            />
                                        ) : (
                                            <p className="text-lg font-bold text-slate-900">{user?.name || "Not provided"}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Mail className="h-3 w-3" /> Email Address
                                        </label>
                                        <p className="text-lg font-bold text-slate-900">{user?.email}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Calendar className="h-3 w-3" /> Account Type
                                        </label>
                                        <div>
                                            <Badge className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1 font-bold uppercase tracking-wider">
                                                {user?.role || "TRAVELLER"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <Separator className="bg-slate-100" />
                                <div className="flex gap-3">
                                    {isEditing ? (
                                        <>
                                            <Button
                                                variant="outline"
                                                className="rounded-xl border-slate-200 font-bold text-slate-600"
                                                onClick={() => setIsEditing(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                                onClick={handleSaveProfile}
                                                disabled={isSaving}
                                            >
                                                {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                                Save Changes
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            className="rounded-xl border-slate-200 font-bold text-slate-600"
                                            onClick={() => {
                                                setEditName(user?.name || "")
                                                setIsEditing(true)
                                            }}
                                        >
                                            Edit Profile
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-rose-100 soft-shadow-lg overflow-hidden">
                    <CardHeader className="bg-rose-50/50 border-b border-rose-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                                <ShieldAlert className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold text-rose-900">Danger Zone</CardTitle>
                                <CardDescription className="text-rose-600/70">Irreversible account actions</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-1">
                                <h4 className="text-lg font-bold text-slate-900">Delete Account</h4>
                                <p className="text-slate-500 text-sm font-medium">
                                    Once you delete your account, there is no going back. All your bookings,
                                    reviews, and personal data will be permanently removed.
                                </p>
                            </div>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" className="rounded-xl h-12 px-6 font-black shadow-lg shadow-rose-200 flex items-center gap-2">
                                        <Trash2 className="h-4 w-4" />
                                        Delete My Account
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-3xl border-none soft-shadow-2xl p-8">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-black text-slate-900 mb-2">Are you absolutely sure?</DialogTitle>
                                        <DialogDescription className="text-slate-500 font-medium text-base">
                                            This action cannot be undone. This will permanently delete your
                                            account and remove your data from our servers.
                                        </DialogDescription>
                                    </DialogHeader>

                                    {error && (
                                        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold my-4">
                                            ⚠️ {error}
                                        </div>
                                    )}

                                    <DialogFooter className="mt-8 gap-3 sm:gap-0">
                                        <Button
                                            variant="outline"
                                            className="rounded-xl h-12 font-bold border-slate-200"
                                            onClick={() => setIsDeleting(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="rounded-xl h-12 font-black shadow-lg shadow-rose-200"
                                            onClick={handleDeleteAccount}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? (
                                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                            ) : (
                                                <Trash2 className="h-5 w-5 mr-2" />
                                            )}
                                            {isDeleting ? "Deleting..." : "Yes, Delete Account"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default dynamic(() => Promise.resolve(SettingsPage), { ssr: false })
