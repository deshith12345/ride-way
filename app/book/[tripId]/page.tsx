
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import SeatMap from "@/components/shared/SeatMap"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, Bus, ShieldCheck, CreditCard, ChevronRight, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface Seat {
    id: string
    number: string
    status: string
    price: number
}


interface Passenger {
    seat: string
    name: string
    gender: 'male' | 'female'
    idNumber: string
    phone: string
}

export default function BookingPage() {
    const params = useParams()
    const router = useRouter()
    const tripId = params.tripId as string

    const [trip, setTrip] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
    const [passengerDetails, setPassengerDetails] = useState<Passenger[]>([])
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        if (tripId) {
            fetchTripDetails()
        }
    }, [tripId])

    const fetchTripDetails = async () => {
        try {
            const res = await fetch(`/api/trips/${tripId}`)
            const data = await res.json()
            if (data.id) {
                setTrip(data)
            }
        } catch (error) {
            console.error("Failed to fetch trip details:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSeatSelect = (seats: Seat[]) => {
        setSelectedSeats(seats)
        setPassengerDetails(seats.map(s => {
            const existing = passengerDetails.find(p => p.seat === s.number)
            return existing || { seat: s.number, name: "", gender: "male", idNumber: "", phone: "" }
        }))
    }

    const updatePassenger = (idx: number, field: keyof Passenger, value: string) => {
        const newDetails = [...passengerDetails]
        newDetails[idx] = { ...newDetails[idx], [field]: value }
        setPassengerDetails(newDetails)
    }

    const handleCheckout = async () => {
        setIsProcessing(true)
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tripId,
                    seats: passengerDetails
                })
            })

            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                alert(data.error || "Checkout failed")
            }
        } catch (error) {
            console.error("Checkout error:", error)
        } finally {
            setIsProcessing(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-slate-500 font-bold">Preparing your journey...</p>
            </div>
        )
    }

    if (!trip) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                    <Bus className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-black text-slate-900">Trip Not Found</h1>
                <p className="text-slate-500 font-medium">This trip may have expired or was cancelled.</p>
                <Button onClick={() => router.push('/routes')} className="bg-blue-600 rounded-xl px-10">Back to Routes</Button>
            </div>
        )
    }

    const totalPrice = selectedSeats.length * (trip.basePrice || 1500)

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-2 mb-8 text-sm text-slate-500 font-medium">
                    <button onClick={() => router.back()} className="hover:text-blue-600 transition-colors">Search Results</button>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-blue-600 font-bold">Seat Selection</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Seat Selection & Passenger Details */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="rounded-[40px] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
                            <CardHeader className="p-10 pb-2">
                                <CardTitle className="text-3xl font-black text-slate-900">Choose Your Seats</CardTitle>
                                <CardDescription className="text-lg font-medium text-slate-500">Select seats for your journey. Male and female indicators are shown for occupied seats.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-10">
                                <SeatMap totalSeats={trip.bus.totalSeats} onSeatSelect={handleSeatSelect} />
                            </CardContent>
                        </Card>

                        {selectedSeats.length > 0 && (
                            <Card className="rounded-[40px] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <CardHeader className="p-10 pb-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-3xl font-black text-slate-900">Passenger Information</CardTitle>
                                            <CardDescription className="text-lg font-medium text-slate-500">Enter details for each selected seat</CardDescription>
                                        </div>
                                        <Badge className="bg-blue-50 text-blue-600 border-none font-black px-4 py-2 rounded-2xl">{selectedSeats.length} Seats Selected</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-10 space-y-10">
                                    {passengerDetails.map((passenger, idx) => (
                                        <div key={idx} className="space-y-8 p-8 rounded-[32px] bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
                                                        {passenger.seat}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Passenger {idx + 1}</h3>
                                                        <p className="text-xs font-bold text-slate-400">Seat {passenger.seat} Details</p>
                                                    </div>
                                                </div>

                                                {/* Gender Toggle */}
                                                <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                                                    <button
                                                        onClick={() => updatePassenger(idx, 'gender', 'male')}
                                                        className={cn(
                                                            "px-6 py-2 rounded-xl text-xs font-black transition-all",
                                                            passenger.gender === 'male' ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                                                        )}
                                                    >
                                                        MALE
                                                    </button>
                                                    <button
                                                        onClick={() => updatePassenger(idx, 'gender', 'female')}
                                                        className={cn(
                                                            "px-6 py-2 rounded-xl text-xs font-black transition-all",
                                                            passenger.gender === 'female' ? "bg-rose-500 text-white shadow-md" : "text-slate-400 hover:text-rose-500"
                                                        )}
                                                    >
                                                        FEMALE
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                <div className="space-y-2">
                                                    <Label className="text-slate-400 font-black uppercase text-[10px] tracking-widest ml-4">Full Name</Label>
                                                    <Input
                                                        placeholder="As per ID"
                                                        className="bg-white border-slate-200 h-14 rounded-2xl focus:ring-blue-500 font-bold px-6 shadow-sm"
                                                        value={passenger.name}
                                                        onChange={(e) => updatePassenger(idx, 'name', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-slate-400 font-black uppercase text-[10px] tracking-widest ml-4">NIC / Passport</Label>
                                                    <Input
                                                        placeholder="ID Number"
                                                        className="bg-white border-slate-200 h-14 rounded-2xl focus:ring-blue-500 font-bold px-6 shadow-sm"
                                                        value={passenger.idNumber}
                                                        onChange={(e) => updatePassenger(idx, 'idNumber', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-slate-400 font-black uppercase text-[10px] tracking-widest ml-4">Phone Number</Label>
                                                    <Input
                                                        placeholder="+94 XX XXX XXXX"
                                                        className="bg-white border-slate-200 h-14 rounded-2xl focus:ring-blue-500 font-bold px-6 shadow-sm"
                                                        value={passenger.phone}
                                                        onChange={(e) => updatePassenger(idx, 'phone', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Booking Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24 rounded-[40px] border-none shadow-2xl shadow-slate-300/50 overflow-hidden bg-white">
                            <CardHeader className="bg-slate-900 text-white p-10">
                                <CardTitle className="text-2xl font-black">Booking Summary</CardTitle>
                                <div className="mt-4 flex items-center gap-2 text-blue-300 font-bold italic text-xs">
                                    <ShieldCheck className="h-4 w-4" /> <span>Secure SSL Encrypted Booking</span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-10 space-y-8">
                                <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 space-y-6 shadow-inner">
                                    <div className="font-black text-2xl text-slate-900 leading-tight">{trip.route.origin} to {trip.route.destination}</div>
                                    <div className="space-y-4">
                                        <div className="flex items-center text-sm text-slate-600 gap-4 font-bold">
                                            <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm"><Calendar className="h-5 w-5 text-blue-500" /></div>
                                            <span>{format(new Date(trip.departureTime), 'EEE, dd MMM yyyy')}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 gap-4 font-bold">
                                            <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm"><Clock className="h-5 w-5 text-blue-500" /></div>
                                            <span>{format(new Date(trip.departureTime), 'hh:mm a')} Departure</span>
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 gap-4 font-bold">
                                            <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm"><Bus className="h-5 w-5 text-blue-500" /></div>
                                            <span>{trip.bus.type} ({trip.bus.registrationNo})</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 px-2">
                                    <div className="flex justify-between items-start">
                                        <span className="text-slate-400 font-black uppercase tracking-widest text-[10px] mt-2">Seats Selected</span>
                                        <div className="flex gap-2 flex-wrap justify-end max-w-[150px]">
                                            {selectedSeats.length > 0 ? selectedSeats.map((s, i) => (
                                                <Badge key={i} variant="secondary" className="bg-blue-600 text-white border-none font-black px-4 py-1.5 rounded-xl shadow-lg shadow-blue-100">{s.number}</Badge>
                                            )) : <span className="text-slate-400 italic">No seats selected</span>}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Price per seat</span>
                                        <span className="text-slate-900 font-black">LKR {trip.basePrice?.toLocaleString() || "1,500"}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Service Fee</span>
                                        <span className="text-slate-900 font-black">LKR 150</span>
                                    </div>
                                </div>

                                <Separator className="bg-slate-100" />

                                <div className="px-2 py-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Total Amount</span>
                                        <span className="text-4xl font-black text-blue-600 tracking-tighter">LKR {(totalPrice + (selectedSeats.length > 0 ? 150 : 0)).toLocaleString()}</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleCheckout}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-20 rounded-[28px] text-xl font-black shadow-2xl shadow-blue-100 hover:shadow-blue-200 transition-all disabled:opacity-50 active:scale-95 group relative overflow-hidden"
                                    size="lg"
                                    disabled={selectedSeats.length === 0 || isProcessing}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative flex items-center justify-center">
                                        {isProcessing ? (
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                        ) : (
                                            <><CreditCard className="mr-4 h-6 w-6 group-hover:rotate-12 transition-transform" /> Confirm & Pay Now</>
                                        )}
                                    </div>
                                </Button>

                                <div className="pt-2">
                                    <p className="text-center text-[10px] text-slate-400 font-bold px-4 leading-relaxed uppercase tracking-widest opacity-60">
                                        By confirming, you agree to our <br /> Terms of Service & Refund Policy
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
