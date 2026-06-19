"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Users, Navigation, Calendar, ShieldCheck, ChevronRight, LogOut, Loader2 } from "lucide-react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { format } from "date-fns"

import dynamic from "next/dynamic"

function DriverDashboard() {
    const { data: session } = useSession()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/driver/stats')
            const resData = await res.json()
            setData(resData)
        } catch (err) {
            console.error("Failed to fetch driver stats:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    const handleStartTrip = async () => {
        if (!data?.activeTrip) return
        setActionLoading(true)
        try {
            const res = await fetch(`/api/trips/${data.activeTrip.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'DEPARTED' })
            })
            if (res.ok) {
                await fetchStats()
            }
        } catch (err) {
            console.error("Failed to start trip:", err)
        } finally {
            setActionLoading(false)
        }
    }
    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-start w-full">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-slate-900">Good {new Date().getHours() < 12 ? "Morning" : "Afternoon"}, {session?.user?.name?.split(" ")[0]}</h1>
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 px-3 py-1 font-bold uppercase tracking-wider">Driver Account</Badge>
                            {data?.activeTrip && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 px-3 py-1 font-bold">ACTIVE NOW</Badge>}
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 font-medium">
                            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-blue-500" /> Bus No: {data?.performance?.busNo || "---"}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span>{data?.performance?.busType || "---"}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-black text-slate-900 leading-none">{session?.user?.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bus Driver</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-blue-50 border-2 border-white shadow-lg overflow-hidden flex items-center justify-center text-blue-600 font-black">
                            {session?.user?.image ? (
                                <img src={session.user.image} alt="" className="h-full w-full object-cover" />
                            ) : (
                                session?.user?.name?.[0] || "D"
                            )}
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="rounded-xl border-slate-200 font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100"
                        >
                            <LogOut className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </div>
                </div>

                {/* Today's Active Trip */}
                {!loading && data?.activeTrip ? (
                    <Card className="mb-12 soft-shadow-lg border-emerald-100 overflow-hidden group">
                        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                            <div className="lg:flex-1 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">NEXT ASSIGNED TRIP • {format(new Date(data.activeTrip.departureTime), 'hh:mm a')}</span>
                                </div>

                                <h2 className="text-4xl font-black text-slate-900 mb-8 flex items-center gap-4">
                                    {data.activeTrip.route.origin} <ChevronRight className="h-8 w-8 text-slate-200" /> {data.activeTrip.route.destination}
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                                            <Users className="h-4 w-4 text-blue-500" /> PASSENGERS
                                        </div>
                                        <div className="text-2xl font-bold text-slate-900">{data.activeTrip._count.bookings} <span className="text-slate-300 font-medium">/ {data.activeTrip.bus.totalSeats}</span></div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                                            <Clock className="h-4 w-4 text-orange-500" /> DEPARTURE
                                        </div>
                                        <div className="text-2xl font-bold text-slate-900">{format(new Date(data.activeTrip.departureTime), 'hh:mm a')}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                                            <MapPin className="h-4 w-4 text-purple-500" /> STATUS
                                        </div>
                                        <div className="text-2xl font-bold text-slate-900">{data.activeTrip.status}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50/50 lg:w-80 p-8 flex flex-col justify-center gap-4">
                                <Button
                                    className="gradient-primary text-white h-14 rounded-2xl text-lg font-bold shadow-lg hover:shadow-2xl transition-all"
                                    onClick={handleStartTrip}
                                    disabled={actionLoading || data.activeTrip.status === 'DEPARTED'}
                                >
                                    {actionLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Navigation className="mr-2 h-5 w-5" />}
                                    {data.activeTrip.status === 'DEPARTED' ? 'Trip Started' : 'Start Trip'}
                                </Button>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link href="/driver/scan" className="w-full">
                                        <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 hover:bg-white text-slate-600">Scan QR</Button>
                                    </Link>
                                    <Link href={`/driver/trips/${data.activeTrip.id}`} className="w-full">
                                        <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 hover:bg-white text-slate-600">Manifest</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Card>
                ) : !loading && (
                    <Card className="mb-12 p-12 text-center border-dashed border-2 border-slate-200 bg-slate-50 rounded-3xl">
                        <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No active trips today</h3>
                        <p className="text-slate-500">You're all caught up! Check back later for your next assignment.</p>
                    </Card>
                )}

                {loading && (
                    <Card className="mb-12 p-32 animate-pulse bg-slate-50 border-slate-100 rounded-3xl"></Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-900">Upcoming Schedule</h2>
                            <Button variant="ghost" onClick={fetchStats} className="text-blue-600 font-bold hover:bg-blue-50">Refresh Schedule</Button>
                        </div>
                        <div className="space-y-4">
                            {loading ? (
                                Array(2).fill(0).map((_, i) => (
                                    <div key={i} className="h-24 animate-pulse bg-slate-50 rounded-2xl"></div>
                                ))
                            ) : data?.upcomingTrips?.length === 0 ? (
                                <p className="text-slate-500 text-sm font-medium">No upcoming assigned trips.</p>
                            ) : data?.upcomingTrips?.map((trip: any) => (
                                <Card key={trip.id} className="soft-shadow border-slate-100 hover:border-slate-200 transition-all cursor-pointer group">
                                    <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                                        <div className="flex gap-6 items-center">
                                            <div className="h-14 w-14 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center font-black text-2xl group-hover:bg-blue-50 group-hover:text-blue-200 transition-colors">
                                                {format(new Date(trip.departureTime), 'dd')}
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-slate-900">{trip.route.origin} to {trip.route.destination}</div>
                                                <div className="flex items-center gap-2 text-slate-500 font-medium">
                                                    <Calendar className="h-4 w-4" /> {format(new Date(trip.departureTime), 'MMM dd, yyyy')} <span className="w-1 h-1 bg-slate-300 rounded-full"></span> {format(new Date(trip.departureTime), 'hh:mm a')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold">{format(new Date(trip.departureTime), 'MMM dd').toUpperCase()}</Badge>
                                            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900">Performance</h2>
                        <Card className="soft-shadow border-slate-100 overflow-hidden">
                            <div className="p-6 space-y-6">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">COMPLETION RATE</div>
                                    <span className="text-emerald-600 font-black text-xl">{data?.performance?.score ?? 0}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: `${data?.performance?.score ?? 0}%` }}></div>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">Completion rate is calculated from your assigned trips that are marked completed.</p>
                            </div>
                            <div className="bg-slate-50 p-6 grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs font-bold text-slate-400">TOTAL TRIPS</div>
                                    <div className="text-2xl font-bold text-slate-900">{data?.performance?.totalTrips || 0}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400">COMPLETED</div>
                                    <div className="text-2xl font-bold text-slate-900">{data?.performance?.completedTrips || 0}</div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default dynamic(() => Promise.resolve(DriverDashboard), { ssr: false })
