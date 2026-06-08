
"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Users, MapPin, Clock, Loader2, CheckCircle2, Circle, Bus } from "lucide-react"
import Link from "next/link"

export default function TripManifestPage({ params }: { params: Promise<{ tripId: string }> }) {
    const { tripId } = use(params)
    const [trip, setTrip] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const fetchManifest = async () => {
            try {
                const res = await fetch(`/api/driver/trips/${tripId}`)
                if (!res.ok) {
                    const data = await res.json()
                    setError(data.error || "Failed to load manifest")
                    return
                }
                const data = await res.json()
                setTrip(data)
            } catch (err) {
                setError("Failed to load trip manifest")
            } finally {
                setLoading(false)
            }
        }
        fetchManifest()
    }, [tripId])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        )
    }

    if (error || !trip) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <p className="text-lg font-bold text-slate-700">{error || "Trip not found"}</p>
                <Link href="/driver/dashboard">
                    <Button><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Button>
                </Link>
            </div>
        )
    }

    // Flatten all tickets from all bookings
    const allPassengers = trip.bookings?.flatMap((booking: any) =>
        booking.tickets?.map((ticket: any) => ({
            id: ticket.id,
            name: ticket.passengerName || booking.user?.name || "Unknown",
            email: booking.user?.email || "",
            seatNumber: ticket.seatNumber,
            status: ticket.status,
            bookingId: booking.id,
        })) || []
    ) || []

    const filteredPassengers = allPassengers.filter((p: any) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.seatNumber.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const checkedIn = allPassengers.filter((p: any) => p.status === "USED").length
    const total = allPassengers.length

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container max-w-3xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/driver/dashboard">
                        <Button variant="outline" size="icon" className="rounded-xl">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Trip Manifest</h1>
                        <p className="text-slate-500 text-sm font-medium">{trip.route?.name || "—"}</p>
                    </div>
                </div>

                {/* Trip Info Card */}
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 rounded-xl">
                                    <Bus className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Bus</p>
                                    <p className="font-bold text-slate-900">{trip.bus?.busNumber || "—"} · {trip.bus?.type || ""}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-blue-600" />
                                    <span className="font-bold text-slate-800">{trip.route?.origin}</span>
                                    <span className="text-slate-400">→</span>
                                    <span className="font-bold text-slate-800">{trip.route?.destination}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Clock className="h-4 w-4" />
                                    {new Date(trip.departureTime).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats + Search */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-bold py-1.5 px-3 text-sm">
                            <Users className="h-4 w-4 mr-1.5" /> {total} Passengers
                        </Badge>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold py-1.5 px-3 text-sm">
                            <CheckCircle2 className="h-4 w-4 mr-1.5" /> {checkedIn} Boarded
                        </Badge>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search passengers..."
                            className="pl-8 h-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Passenger List */}
                <div className="space-y-3">
                    {filteredPassengers.length === 0 ? (
                        <Card className="border-slate-200">
                            <CardContent className="p-10 text-center">
                                <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">
                                    {total === 0 ? "No passengers booked for this trip yet." : "No matching passengers found."}
                                </p>
                            </CardContent>
                        </Card>
                    ) : filteredPassengers.map((passenger: any) => (
                        <Card key={passenger.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black ${passenger.status === 'USED'
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : 'bg-blue-50 text-blue-600'
                                        }`}>
                                        {passenger.seatNumber}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{passenger.name}</p>
                                        <p className="text-xs text-slate-400">{passenger.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {passenger.status === 'USED' ? (
                                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold">
                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Boarded
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-bold">
                                            <Circle className="h-3 w-3 mr-1" /> Waiting
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
