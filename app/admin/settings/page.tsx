
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Settings, Globe, CreditCard, Shield, Bell, Database, CheckCircle2, XCircle } from "lucide-react"

export default function AdminSettingsPage() {
    const stripeConfigured = !!process.env.NEXT_PUBLIC_STRIPE_KEY

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
                <p className="text-slate-500 mt-1">View and manage platform configuration.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Platform Info */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Globe className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Platform Information</CardTitle>
                                <CardDescription>General platform settings</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Label className="text-slate-600">Platform Name</Label>
                            <Input value="RideWay" disabled className="bg-slate-50 font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-600">Support Email</Label>
                            <Input value="support@rideway.lk" disabled className="bg-slate-50" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-600">Currency</Label>
                            <Input value="LKR (Sri Lankan Rupee)" disabled className="bg-slate-50" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-600">Version</Label>
                            <Input value="0.1.0 (Beta)" disabled className="bg-slate-50" />
                        </div>
                    </CardContent>
                </Card>

                {/* Service Status */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <Database className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Service Status</CardTitle>
                                <CardDescription>Connected services and integrations</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <Database className="h-5 w-5 text-emerald-600" />
                                <div>
                                    <p className="font-bold text-slate-900">MongoDB</p>
                                    <p className="text-xs text-slate-500">Database</p>
                                </div>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="font-bold text-slate-900">Stripe</p>
                                    <p className="text-xs text-slate-500">Payment Processing</p>
                                </div>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Configured
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-indigo-600" />
                                <div>
                                    <p className="font-bold text-slate-900">NextAuth</p>
                                    <p className="text-xs text-slate-500">Authentication</p>
                                </div>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <Globe className="h-5 w-5 text-amber-600" />
                                <div>
                                    <p className="font-bold text-slate-900">Cloudinary</p>
                                    <p className="text-xs text-slate-500">Image Storage</p>
                                </div>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Shield className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Security</CardTitle>
                                <CardDescription>Authentication & access control</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">Google OAuth</span>
                            <Badge className="bg-emerald-100 text-emerald-700 font-bold">Enabled</Badge>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">Email/Password Auth</span>
                            <Badge className="bg-emerald-100 text-emerald-700 font-bold">Enabled</Badge>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">Role-Based Access</span>
                            <Badge className="bg-emerald-100 text-emerald-700 font-bold">Active</Badge>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">Session Strategy</span>
                            <Badge variant="secondary" className="font-bold">JWT</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Preferences */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <Bell className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Notifications</CardTitle>
                                <CardDescription>System notification preferences</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">Email Notifications</span>
                            <Badge variant="secondary" className="font-bold">Coming Soon</Badge>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">SMS Alerts</span>
                            <Badge variant="secondary" className="font-bold">Coming Soon</Badge>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">Push Notifications</span>
                            <Badge variant="secondary" className="font-bold">Coming Soon</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
