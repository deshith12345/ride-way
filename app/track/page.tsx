"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Bus, Clock, Info, Loader2, MapPin, Search, ShieldCheck, TicketCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type TrackResult = {
    type: "ticket" | "bus"
    liveGpsAvailable: boolean
    ticket?: {
        id: string
        seatNumber: string
        passengerName: string
        status: string
    }
    booking?: {
        status: string
        paymentStatus: string
    }
    bus?: {
        registrationNo: string
        number?: string | null
        type: string
    }
    trip?: {
        status: string
        departureTime: string
        arrivalTime: string
        route: {
            origin: string
            destination: string
            name?: string | null
        }
        bus: {
            registrationNo: string
            type: string
        }
    } | null
}

export default function TrackBusPage() {
    const [reference, setReference] = useState("")
    const [searched, setSearched] = useState(false)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<TrackResult | null>(null)
    const [error, setError] = useState("")

    const handleSearch = async (event: React.FormEvent) => {
        event.preventDefault()
        const query = reference.trim()
        if (!query) return

        setLoading(true)
        setSearched(true)
        setError("")
        setResult(null)

        try {
            const response = await fetch(`/api/track?q=${encodeURIComponent(query)}`)
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Unable to track this reference")
            setResult(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to track this reference")
        } finally {
            setLoading(false)
        }
    }

    const trip = result?.trip

    return (
        <div className="min-h-screen bg-[#f6f8fb] pb-20 pt-12">
            <div className="container mx-auto max-w-5xl px-4">
                <div className="mx-auto mb-10 max-w-2xl text-center">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-blue-50 text-blue-700 shadow-sm">
                        <Bus className="h-7 w-7" />
                    </div>
                    <h1 className="text-4xl font-black tracking-normal text-slate-950">Track Bus</h1>
                    <p className="mx-auto mt-3 max-w-xl font-medium leading-7 text-slate-600">
                        Enter a bus number, ticket ID, or QR value to check the latest RideWay schedule status.
                    </p>
                </div>

                <Card className="mx-auto max-w-2xl rounded-[2rem] border-white bg-white/80 shadow-xl shadow-slate-200/70 backdrop-blur-xl">
                    <CardContent className="p-4 sm:p-5">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={reference}
                                onChange={(event) => {
                                    setReference(event.target.value)
                                    setSearched(false)
                                    setResult(null)
                                    setError("")
                                }}
                                placeholder="Enter bus number, ticket ID, or QR value"
                                className="h-14 rounded-[1.4rem] border-slate-200 bg-white pl-12 pr-32 text-base font-bold shadow-sm"
                            />
                            <Button
                                type="submit"
                                disabled={loading || !reference.trim()}
                                className="absolute right-1.5 top-1.5 h-11 rounded-[1.1rem] bg-blue-600 px-5 font-black text-white hover:bg-blue-700"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {searched && !loading && error && (
                    <div className="mx-auto mt-8 max-w-2xl rounded-[2rem] border border-rose-100 bg-rose-50/80 p-6 shadow-lg shadow-rose-100/40">
                        <div className="flex gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-white text-rose-700 shadow-sm">
                                <Info className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-black text-slate-950">Reference not found</h2>
                                <p className="mt-2 font-medium leading-7 text-slate-600">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {result && !loading && (
                    <div className="mx-auto mt-8 max-w-2xl space-y-4">
                        {trip ? (
                            <Card className="rounded-[2rem] border-blue-100 bg-white shadow-xl shadow-slate-200/60">
                                <CardContent className="space-y-6 p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <div className="mb-2 flex items-center gap-2">
                                                <Badge className="bg-blue-50 text-blue-700 border-blue-100">{result.type === "ticket" ? "Ticket Match" : "Bus Match"}</Badge>
                                                <Badge className="bg-slate-100 text-slate-700 border-slate-200">{trip.status}</Badge>
                                            </div>
                                            <h2 className="text-2xl font-black text-slate-950">{trip.route.origin} to {trip.route.destination}</h2>
                                            <p className="mt-1 text-sm font-bold text-slate-500">{trip.bus.registrationNo} - {trip.bus.type}</p>
                                        </div>
                                        {result.ticket && (
                                            <div className="rounded-2xl bg-blue-50 px-4 py-3 text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Seat</p>
                                                <p className="text-xl font-black text-blue-700">{result.ticket.seatNumber}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                                                <Clock className="h-4 w-4" /> Departure
                                            </div>
                                            <p className="font-black text-slate-900">{format(new Date(trip.departureTime), "EEE, dd MMM yyyy")}</p>
                                            <p className="text-sm font-bold text-slate-500">{format(new Date(trip.departureTime), "hh:mm a")}</p>
                                        </div>
                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                                                <MapPin className="h-4 w-4" /> Arrival
                                            </div>
                                            <p className="font-black text-slate-900">{format(new Date(trip.arrivalTime), "EEE, dd MMM yyyy")}</p>
                                            <p className="text-sm font-bold text-slate-500">{format(new Date(trip.arrivalTime), "hh:mm a")}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="rounded-[2rem] border-amber-100 bg-amber-50/80 shadow-lg shadow-amber-100/40">
                                <CardContent className="flex gap-4 p-6">
                                    <Info className="mt-1 h-5 w-5 text-amber-700" />
                                    <div>
                                        <h2 className="font-black text-slate-950">Bus found, no active trip</h2>
                                        <p className="mt-2 font-medium leading-7 text-slate-600">This bus is registered, but it has no upcoming or active trip right now.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="rounded-[2rem] border border-white bg-white/70 p-6 shadow-lg shadow-slate-200/50 backdrop-blur-xl">
                            <div className="flex gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-emerald-50 text-emerald-700">
                                    {result.type === "ticket" ? <TicketCheck className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                                </div>
                                <div>
                                    <h2 className="font-black text-slate-950">Schedule status is available</h2>
                                    <p className="mt-2 font-medium leading-7 text-slate-600">
                                        Live map coordinates require a connected fleet GPS provider. This lookup shows verified RideWay ticket, bus, and trip status data.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
