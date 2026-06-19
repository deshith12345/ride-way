"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { Bus, CalendarCheck, DollarSign, Users, BarChart3, RefreshCw, Loader2 } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
    const [stats, setStats] = useState<any[]>([])
    const [activities, setActivities] = useState<any[]>([])
    const [revenueByDay, setRevenueByDay] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchStats = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/stats')
            const data = await res.json()
            if (data.stats) setStats(data.stats)
            if (data.activity) setActivities(data.activity)
            if (data.revenueByDay) setRevenueByDay(data.revenueByDay)
        } catch (err) {
            console.error("Failed to fetch stats:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    const downloadReport = () => {
        const rows = [
            ["RideWay Admin Report"],
            ["Generated", new Date().toLocaleString()],
            [],
            ["Metric", "Value", "Trend"],
            ...stats.map((item) => [item.title, item.value, item.trend]),
            [],
            ["Recent Activity"],
            ["User", "Action", "Time"],
            ...activities.map((item) => [item.user, item.action, item.time]),
        ]
        const csv = rows
            .map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","))
            .join("\n")
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `rideway-report-${new Date().toISOString().slice(0, 10)}.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    const iconMap: Record<string, any> = {
        DollarSign,
        CalendarCheck,
        Bus,
        Users
    }

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1 font-bold">ADMIN ACCOUNT</Badge>
                    </div>
                    <p className="text-slate-500 mt-1">Welcome back, here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={downloadReport} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors soft-shadow">Download Report</button>
                    <Link href="/admin/users" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">Manage Users</Link>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <Card key={i} className="animate-pulse h-32 bg-slate-50 border-slate-100"></Card>
                    ))
                ) : stats.map((item, i) => {
                    const Icon = iconMap[item.icon] || DollarSign
                    return (
                        <Card key={i} className="soft-shadow border-slate-100 hover:border-slate-200 transition-all">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">{item.title}</CardTitle>
                                <div className={`p-2 rounded-lg ${item.bg}`}>
                                    <Icon className={`h-4 w-4 ${item.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">{item.value}</div>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs font-bold text-slate-500">{item.trend}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Chart Area */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
                <Card className="lg:col-span-4 soft-shadow border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-8">
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-900">Revenue Overview</CardTitle>
                            <CardDescription>Paid booking revenue for the past 7 days</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm font-bold">
                            <BarChart3 className="h-4 w-4" /> Live totals
                        </div>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={revenueByDay}>
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `LKR ${value / 1000}k`} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                                    {revenueByDay.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.total > 0 ? '#2563eb' : '#e2e8f0'} className="hover:fill-blue-400 transition-colors" />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 soft-shadow border-slate-100">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-900">Recent Activity</CardTitle>
                        <CardDescription>Latest system updates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                </div>
                            ) : activities.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-10">No recent activity.</p>
                            ) : activities.map((activity, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 font-bold text-xs text-slate-500">
                                        {activity.user[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-900 font-medium">
                                            <span className="font-bold">{activity.user}</span> {activity.action}
                                        </p>
                                        <span className="text-xs text-slate-400">{activity.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" onClick={fetchStats} className="w-full mt-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            Refresh Activity <RefreshCw className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
