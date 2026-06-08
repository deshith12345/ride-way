
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bus, MapPin, Navigation, Clock, Search, Loader2, ChevronRight, Info } from "lucide-react"

export default function TrackBusPage() {
    const [busNo, setBusNo] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [trackingData, setTrackingData] = useState<any>(null)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!busNo) return

        setIsSearching(true)
        // Simulate API call
        setTimeout(() => {
            setTrackingData({
                registrationNo: busNo.toUpperCase(),
                driver: "K. Samantha",
                route: "Colombo - Kandy",
                status: "On Time",
                currentLocation: "Warikapola",
                nextStop: "Kegalle",
                eta: "45 mins",
                speed: "65 km/h",
                lastUpdated: "Just now"
            })
            setIsSearching(false)
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-10 pb-20">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Live Bus Tracking</h1>
                    <p className="text-slate-500 font-medium max-w-xl mx-auto">Enter your bus registration number or booking reference to see real-time location and estimated arrival times.</p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-12">
                    <form onSubmit={handleSearch} className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <Input
                            value={busNo}
                            onChange={(e) => setBusNo(e.target.value)}
                            placeholder="Enter Bus No. (e.g. WP NB-1234)"
                            className="h-16 pl-12 pr-32 rounded-2xl border-slate-200 bg-white shadow-xl shadow-slate-200/50 text-lg font-bold group-focus-within:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
                        />
                        <div className="absolute inset-y-2 right-2 flex items-center">
                            <Button
                                type="submit"
                                disabled={isSearching}
                                className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 font-black text-white shadow-lg shadow-blue-200 transition-all hover:-translate-x-1 active:scale-95"
                            >
                                {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : "Track Now"}
                            </Button>
                        </div>
                    </form>
                </div>

                {trackingData ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        {/* Status Card */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden">
                                <CardHeader className="bg-blue-600 text-white p-6 pb-8">
                                    <div className="flex justify-between items-center mb-2">
                                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm px-3 py-1 font-bold">
                                            {trackingData.status}
                                        </Badge>
                                        <span className="text-[10px] uppercase font-black tracking-widest opacity-80">Ref: RD-9921</span>
                                    </div>
                                    <CardTitle className="text-3xl font-black mb-1">{trackingData.registrationNo}</CardTitle>
                                    <CardDescription className="text-blue-100 font-bold">{trackingData.route}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-slate-100">
                                        <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                                    <MapPin className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Current Location</p>
                                                    <p className="text-sm font-bold text-slate-900">{trackingData.currentLocation}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-slate-300" />
                                        </div>
                                        <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                                    <Navigation className="h-5 w-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Next Stop</p>
                                                    <p className="text-sm font-bold text-slate-900">{trackingData.nextStop}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-slate-300" />
                                        </div>
                                        <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                                    <Clock className="h-5 w-5 text-amber-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Estimated Arrival</p>
                                                    <p className="text-sm font-bold text-slate-900">{trackingData.eta}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-slate-300" />
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-50 flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        <span>Updated: {trackingData.lastUpdated}</span>
                                        <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Signal</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-slate-500 font-bold">KS</div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Current Driver</p>
                                    <p className="text-sm font-bold text-slate-900">{trackingData.driver}</p>
                                </div>
                                <Button variant="outline" size="sm" className="rounded-full font-bold text-[10px] uppercase">Message</Button>
                            </div>
                        </div>

                        {/* Map Simulation */}
                        <div className="lg:col-span-2">
                            <div className="h-[500px] w-full bg-slate-200 rounded-3xl relative overflow-hidden shadow-2xl border-4 border-white">
                                {/* Map Background Image Logic - Using a placeholder premium map texture */}
                                <div className="absolute inset-0 bg-[#e5e7eb] opacity-80" style={{ backgroundImage: 'radial-gradient(#9ca3af 0.5px, transparent 0.5px)', backgroundSize: '12px 12px' }} />

                                {/* Route Line */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                    <path
                                        d="M 100 400 Q 250 350 400 300 T 700 100"
                                        fill="none"
                                        stroke="#2563eb"
                                        strokeWidth="6"
                                        strokeLinecap="round"
                                        strokeDasharray="12 12"
                                        className="opacity-40"
                                    />
                                    <path
                                        d="M 100 400 Q 250 350 400 300"
                                        fill="none"
                                        stroke="#2563eb"
                                        strokeWidth="6"
                                        strokeLinecap="round"
                                    />
                                </svg>

                                {/* Bus Marker */}
                                <div className="absolute left-[400px] top-[300px] -translate-x-1/2 -translate-y-1/2 z-20">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-50 h-10 w-10 -m-1" />
                                        <div className="h-8 w-8 bg-blue-600 rounded-xl rotate-45 flex items-center justify-center shadow-lg border-2 border-white">
                                            <Bus className="h-4 w-4 text-white -rotate-45" />
                                        </div>
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-xl text-[10px] font-black whitespace-nowrap border border-slate-100 italic">
                                            {trackingData.speed}
                                        </div>
                                    </div>
                                </div>

                                {/* Destination Marker */}
                                <div className="absolute right-[50px] top-[100px] z-10">
                                    <div className="h-4 w-4 bg-emerald-500 rounded-full border-4 border-white shadow-lg shadow-emerald-200" />
                                    <span className="absolute left-6 -top-1 text-xs font-bold text-slate-600">Kandy</span>
                                </div>

                                {/* Info Overlays */}
                                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/40 flex items-center gap-3">
                                        <Info className="h-4 w-4 text-blue-500" />
                                        <p className="text-[11px] font-bold text-slate-600">Signal from GPS satellite #402 is stable.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="h-10 w-10 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50">+</button>
                                        <button className="h-10 w-10 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50">-</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center opacity-40">
                        <div className="h-24 w-24 bg-slate-200 rounded-full mb-6 flex items-center justify-center">
                            <Bus className="h-10 w-10 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-bold italic tracking-wide">Waiting for tracking input...</p>
                    </div>
                )}
            </div>
        </div>
    )
}
