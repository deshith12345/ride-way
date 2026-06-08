
"use client"

import { Bus, Clock, MapPin, Wifi, Zap, Tv, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"

interface BusResult {
    id: string
    operator: string
    busType: string
    departureTime: string | Date
    arrivalTime: string | Date
    duration: string
    origin: string
    destination: string
    price: number
    seatsAvailable: number
    amenities: string[]
}

const amenityIcons: Record<string, React.ReactNode> = {
    WIFI: <Wifi className="h-4 w-4" />,
    USB: <Zap className="h-4 w-4" />,
    TV: <Tv className="h-4 w-4" />,
}

export default function BusResultCard({
    id,
    operator = "RideWay Express",
    busType = "Luxury AC",
    departureTime = "08:00 AM",
    arrivalTime = "11:30 AM",
    duration = "3h 30m",
    origin = "Colombo",
    destination = "Kandy",
    price = 1500,
    seatsAvailable = 24,
    amenities = ["WIFI", "USB"]
}: Partial<BusResult>) {

    const formattedDep = typeof departureTime === 'string' ? departureTime : format(new Date(departureTime), 'hh:mm a')
    const formattedArr = typeof arrivalTime === 'string' ? arrivalTime : format(new Date(arrivalTime), 'hh:mm a')

    return (
        <Card className="flex flex-col md:flex-row overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-100 group">
            <div className="md:w-1/4 bg-slate-50 p-6 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-slate-100 group-hover:bg-blue-50 transition-colors">
                <div className="h-16 w-16 bg-white rounded-2xl soft-shadow flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Bus className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-center">{operator}</h3>
                <div className="flex items-center gap-1 mt-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider">
                    <ShieldCheck className="h-3 w-3" /> Verified
                </div>
            </div>

            <div className="flex-1 p-6">
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <span className="block text-2xl font-bold text-slate-900">{formattedDep}</span>
                                <span className="text-xs text-slate-500 uppercase font-semibold">{origin}</span>
                            </div>

                            <div className="flex-1 flex flex-col items-center">
                                <span className="text-xs text-slate-400 mb-1">{duration}</span>
                                <div className="w-full flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                                    <div className="flex-1 h-px border-t-2 border-dashed border-slate-200"></div>
                                    <div className="h-1.5 w-1.5 rounded-full border-2 border-blue-600"></div>
                                </div>
                                <Badge variant="secondary" className="mt-2 text-[10px] h-5 bg-slate-100 text-slate-600 border-none">{busType}</Badge>
                            </div>

                            <div className="text-center">
                                <span className="block text-2xl font-bold text-slate-900">{formattedArr}</span>
                                <span className="text-xs text-slate-500 uppercase font-semibold">{destination}</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:text-right border-t lg:border-t-0 pt-4 lg:pt-0 lg:pl-6 lg:border-l border-slate-100">
                        <div className="text-3xl font-bold text-blue-600">
                            <span className="text-sm font-normal text-slate-500 mr-1">LKR</span>
                            {price}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">per passenger</div>
                    </div>
                </div>

                <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-slate-50">
                    <div className="flex gap-4">
                        {amenities.map(a => (
                            <div key={a} className="flex items-center gap-2 text-xs text-slate-500 group/amenity" title={a}>
                                <div className="p-1.5 bg-slate-100 rounded-lg group-hover/amenity:bg-blue-100 group-hover/amenity:text-blue-600 transition-colors">
                                    {amenityIcons[a] || <Wifi className="h-3.5 w-3.5" />}
                                </div>
                                <span className="font-medium">{a}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-sm text-amber-600 font-bold">{seatsAvailable} seats left</div>
                        </div>
                        <Link href={`/book/${id}`}>
                            <Button className="gradient-primary text-white rounded-xl px-8 hover:shadow-lg transition-all">
                                Select Seats
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </Card>
    )
}
