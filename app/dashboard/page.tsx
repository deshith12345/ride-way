
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bus, Calendar, MapPin, CreditCard, Star, Clock, Loader2, Ticket, XCircle, MessageCircle, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import TicketDialog from "@/components/shared/TicketDialog"
import TravellerSupportChat from "@/components/support/TravellerSupportChat"
import { format } from "date-fns"
import Link from "next/link"

export default function DashboardPage() {
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [cancellingId, setCancellingId] = useState<string | null>(null)

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await fetch('/api/user/bookings')
                const data = await res.json()
                if (Array.isArray(data)) setBookings(data)
            } catch (err) {
                console.error("Fetch bookings failed:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchBookings()
    }, [])

    const handleCancelBooking = async (bookingId: string) => {
        setCancellingId(bookingId)
        try {
            const res = await fetch(`/api/user/bookings/${bookingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'cancel' })
            })
            if (res.ok) {
                setBookings(prev => prev.filter(b => b.id !== bookingId))
            }
        } catch (err) {
            console.error('Cancel failed:', err)
        } finally {
            setCancellingId(null)
        }
    }

    const upcomingBookings = bookings.filter(b => new Date(b.trip.departureTime) > new Date() && b.status !== 'CANCELLED')
    const pastBookings = bookings.filter(b => new Date(b.trip.departureTime) <= new Date() || b.status === 'CANCELLED')

    const totalSpent = bookings.reduce((sum, b) => sum + b.totalAmount, 0)
    const loyaltyPoints = Math.floor(totalSpent / 100)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Dashboard</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage your bookings and travel history</p>
                    </div>
                    <Link href="/settings">
                        <Button className="gradient-primary text-white rounded-2xl px-8 shadow-xl shadow-blue-100 hover:scale-105 transition-all h-12">Edit Profile</Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <Card className="soft-shadow border-none rounded-3xl bg-white overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2 font-bold text-blue-600 uppercase text-[10px] tracking-widest">
                                <Calendar className="h-4 w-4" /> Total Bookings
                            </CardDescription>
                            <CardTitle className="text-4xl font-black text-slate-900 mt-2">{bookings.length}</CardTitle>
                        </CardHeader>
                        <div className="h-1 w-full bg-blue-600 opacity-10 group-hover:opacity-100 transition-opacity" />
                    </Card>
                    <Card className="soft-shadow border-none rounded-3xl bg-white overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2 font-bold text-emerald-600 uppercase text-[10px] tracking-widest">
                                <Star className="h-4 w-4" /> Loyalty Points
                            </CardDescription>
                            <CardTitle className="text-4xl font-black text-slate-900 mt-2">{loyaltyPoints}</CardTitle>
                        </CardHeader>
                        <div className="h-1 w-full bg-emerald-500 opacity-10 group-hover:opacity-100 transition-opacity" />
                    </Card>
                    <Card className="soft-shadow border-none rounded-3xl bg-white overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2 font-bold text-amber-600 uppercase text-[10px] tracking-widest">
                                <CreditCard className="h-4 w-4" /> Total Spent
                            </CardDescription>
                            <CardTitle className="text-4xl font-black text-slate-900 mt-2">LKR {totalSpent.toLocaleString()}</CardTitle>
                        </CardHeader>
                        <div className="h-1 w-full bg-amber-500 opacity-10 group-hover:opacity-100 transition-opacity" />
                    </Card>
                </div>

                <Tabs defaultValue="upcoming" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <TabsList className="bg-white p-1.5 soft-shadow border border-slate-100 rounded-2xl w-fit">
                        <TabsTrigger value="upcoming" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg px-8 py-2.5 font-bold transition-all">Upcoming Trips ({upcomingBookings.length})</TabsTrigger>
                        <TabsTrigger value="past" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg px-8 py-2.5 font-bold transition-all">Past History</TabsTrigger>
                        <TabsTrigger value="support" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg px-8 py-2.5 font-bold transition-all">Support</TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming">
                        <div className="space-y-6">
                            {upcomingBookings.length === 0 ? (
                                <Card className="soft-shadow border-none rounded-3xl bg-white p-12 text-center">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Bus className="h-10 w-10 text-slate-200" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">No upcoming trips</h3>
                                    <p className="text-slate-500 max-w-xs mx-auto">Your next adventure is just a booking away! Explore new routes today.</p>
                                    <Link href="/routes">
                                        <Button className="mt-8 gradient-primary text-white rounded-xl px-10 h-12 shadow-lg shadow-blue-100">Find a Bus</Button>
                                    </Link>
                                </Card>
                            ) : upcomingBookings.map((booking, i) => (
                                <Card key={booking.id} className="soft-shadow border-none rounded-3xl bg-white overflow-hidden group hover:ring-2 ring-blue-50 transition-all duration-300">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="flex-1 p-8">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                                                        <Bus className="h-4 w-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{booking.trip.bus.type}</span>
                                                    </div>
                                                    <h3 className="text-2xl font-black text-slate-900 mb-1">{booking.trip.route.origin} to {booking.trip.route.destination}</h3>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">BID-{booking.id.slice(-8).toUpperCase()}</span>
                                                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] tracking-wider py-1 px-3">{booking.status}</Badge>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Paid</p>
                                                    <p className="text-2xl font-black text-slate-900">LKR {booking.totalAmount.toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Date</p>
                                                    <p className="text-sm font-bold text-slate-700">{format(new Date(booking.trip.departureTime), 'MMM dd, yyyy')}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Clock className="h-3 w-3" /> Time</p>
                                                    <p className="text-sm font-bold text-slate-700">{format(new Date(booking.trip.departureTime), 'hh:mm a')}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Ticket className="h-3 w-3" /> Seats</p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {booking.tickets.map((t: any) => (
                                                            <span key={t.id} className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100">{t.seatNumber}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Bus</p>
                                                    <p className="text-sm font-bold text-slate-700">{booking.trip.bus.registrationNo}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50/50 p-8 flex flex-col items-center justify-center md:w-64 border-t md:border-t-0 md:border-l border-slate-50 group-hover:bg-blue-50/20 transition-colors gap-3">
                                            {booking.tickets.map((t: any) => (
                                                <TicketDialog
                                                    key={t.id}
                                                    ticket={{
                                                        id: t.id,
                                                        seatNumber: t.seatNumber,
                                                        passengerName: t.passengerName,
                                                        route: `${booking.trip.route.origin} - ${booking.trip.route.destination}`,
                                                        departureDate: format(new Date(booking.trip.departureTime), 'MMM dd, yyyy'),
                                                        departureTime: format(new Date(booking.trip.departureTime), 'hh:mm a'),
                                                        origin: booking.trip.route.origin,
                                                        destination: booking.trip.route.destination,
                                                        busNumber: booking.trip.bus.registrationNo,
                                                        busType: booking.trip.bus.type,
                                                        passengerGender: t.passengerGender,
                                                        qrCode: t.qrCode,
                                                    }}
                                                />
                                            ))}
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" className="w-full rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50 font-bold mt-2 text-xs">
                                                        <XCircle className="h-3.5 w-3.5 mr-1.5" /> Cancel Booking
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="rounded-3xl">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-xl font-black">Cancel Booking?</DialogTitle>
                                                        <DialogDescription>This will cancel your booking and invalidate all tickets. This action cannot be undone.</DialogDescription>
                                                    </DialogHeader>
                                                    <DialogFooter className="gap-3 sm:gap-0">
                                                        <DialogClose asChild>
                                                            <Button variant="outline" className="rounded-xl font-bold">Keep Booking</Button>
                                                        </DialogClose>
                                                        <Button variant="destructive" className="rounded-xl font-bold" onClick={() => handleCancelBooking(booking.id)} disabled={cancellingId === booking.id}>
                                                            {cancellingId === booking.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                                                            Yes, Cancel
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Digital Ticket Ready</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="past">
                        <div className="space-y-6">
                            {pastBookings.length === 0 ? (
                                <Card className="soft-shadow border-none rounded-3xl bg-white p-20 text-center">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Calendar className="h-10 w-10 text-slate-100" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">No past journeys</h3>
                                    <p className="text-slate-500 max-w-xs mx-auto">Your travel history is empty for now. Start exploring Sri Lanka with us!</p>
                                </Card>
                            ) : pastBookings.map((booking, i) => (
                                <Card key={booking.id} className="soft-shadow border-none rounded-3xl bg-white opacity-70 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 transition-all duration-500 overflow-hidden">
                                    <div className="p-8 flex justify-between items-center group">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{format(new Date(booking.trip.departureTime), 'MMM dd, yyyy')}</p>
                                            <h3 className="text-xl font-black text-slate-900">{booking.trip.route.origin} to {booking.trip.route.destination}</h3>
                                        </div>
                                        <div className="flex items-center gap-12">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Spent</p>
                                                <p className="text-lg font-black text-slate-900">LKR {booking.totalAmount.toLocaleString()}</p>
                                            </div>
                                            <Badge variant="outline" className="rounded-xl border-slate-200 text-slate-400 font-bold px-4 py-1.5 h-fit group-hover:bg-slate-50 transition-colors">COMPLETED</Badge>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="support">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                            <Card className="soft-shadow border-none rounded-3xl bg-white p-8">
                                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-700">
                                    <MessageCircle className="h-4 w-4" />
                                    Traveller Support
                                </div>
                                <h2 className="text-3xl font-black tracking-tight text-slate-900">Need help with a trip?</h2>
                                <p className="mt-4 text-sm font-semibold leading-7 text-slate-500">
                                    Start a secure conversation with RideWay support for booking, payment, QR ticket, delay, or account questions.
                                </p>
                                <div className="mt-8 grid gap-3">
                                    {[
                                        "Your conversation stays attached to your account",
                                        "Admins can reply from the protected support inbox",
                                        "You can return here anytime to continue the chat",
                                    ].map((item) => (
                                        <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
                                            <ShieldCheck className="h-4 w-4 text-blue-600" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                            <TravellerSupportChat />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
