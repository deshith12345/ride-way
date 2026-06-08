
"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import SearchWidget from "@/components/shared/SearchWidget"
import BusResultCard from "@/components/shared/BusResultCard"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2, Bus as BusIcon, MapPin } from "lucide-react"

function SearchResults() {
    const searchParams = useSearchParams()
    const [trips, setTrips] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const date = searchParams.get("date")

    useEffect(() => {
        fetchTrips()
    }, [searchParams])

    const fetchTrips = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/trips/search?${searchParams.toString()}`)
            const data = await res.json()
            if (Array.isArray(data)) {
                setTrips(data)
            }
        } catch (error) {
            console.error("Failed to fetch trips:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Search Header - Light Theme */}
            <div className="bg-white border-b border-slate-200 py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <BusIcon className="h-8 w-8 text-blue-600" />
                            {from && to ? `${from} to ${to}` : "Find Your Journey"}
                        </h1>
                        <SearchWidget />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl soft-shadow border border-slate-100 sticky top-24">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Filters</h3>

                        {/* Bus Type */}
                        <div className="mb-8">
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Bus Type</h4>
                            <div className="space-y-4">
                                {[
                                    { id: "ac", label: "AC" },
                                    { id: "non-ac", label: "Non-AC" },
                                    { id: "luxury", label: "Luxury" },
                                    { id: "highway", label: "Highway" }
                                ].map(type => (
                                    <div key={type.id} className="flex items-center space-x-3">
                                        <Checkbox id={type.id} className="border-slate-300 data-[state=checked]:bg-blue-600" />
                                        <Label htmlFor={type.id} className="text-slate-700 cursor-pointer font-medium">{type.label}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="w-full py-3 text-sm font-bold text-blue-600 border border-blue-600 rounded-xl hover:bg-blue-50 transition-colors">
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* Results List */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 soft-shadow">
                        <span className="font-bold text-slate-900">{trips.length} Buses Available</span>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-500 font-medium">Sort by:</span>
                            <select className="text-sm bg-transparent border-none font-bold text-blue-600 focus:ring-0 cursor-pointer">
                                <option>Recommended</option>
                                <option>Price: Low to High</option>
                                <option>Departure: Earliest</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                                <p className="text-slate-500 font-bold">Searching for best buses...</p>
                            </div>
                        ) : trips.length === 0 ? (
                            <div className="py-20 text-center bg-white rounded-3xl border-4 border-dashed border-slate-100">
                                <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No buses found</h3>
                                <p className="text-slate-500 max-w-xs mx-auto mb-6">We couldn't find any buses for this route on the selected date.</p>
                                <SearchWidget />
                            </div>
                        ) : (
                            trips.map((trip) => (
                                <BusResultCard
                                    key={trip.id}
                                    id={trip.id}
                                    operator="RideWay Express"
                                    busType={trip.bus.type}
                                    price={trip.basePrice}
                                    departureTime={trip.departureTime}
                                    arrivalTime={trip.arrivalTime}
                                    origin={trip.route.origin}
                                    destination={trip.route.destination}
                                    duration={`${Math.floor((new Date(trip.arrivalTime).getTime() - new Date(trip.departureTime).getTime()) / (1000 * 60 * 60))}h ${Math.floor(((new Date(trip.arrivalTime).getTime() - new Date(trip.departureTime).getTime()) / (1000 * 60)) % 60)}m`}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SearchResultsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>}>
            <SearchResults />
        </Suspense>
    )
}
