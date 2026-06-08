
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Clock, Plus, Loader2, Bus, User, MapPin } from "lucide-react"
import { format } from "date-fns"

export default function SchedulePage() {
    const [trips, setTrips] = useState<any[]>([])
    const [buses, setBuses] = useState<any[]>([])
    const [drivers, setDrivers] = useState<any[]>([])
    const [routes, setRoutes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [newTrip, setNewTrip] = useState({
        routeId: "",
        busId: "",
        driverId: "",
        departureTime: "",
        departureDate: "",
        arrivalTime: "",
        arrivalDate: "",
        basePrice: "1500"
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [tripsRes, busesRes, driversRes, routesRes] = await Promise.all([
                fetch('/api/admin/trips'),
                fetch('/api/admin/buses'),
                fetch('/api/admin/drivers'),
                fetch('/api/admin/routes')
            ])

            const [tripsData, busesData, driversData, routesData] = await Promise.all([
                tripsRes.json(),
                busesRes.json(),
                driversRes.json(),
                routesRes.json()
            ])

            if (Array.isArray(tripsData)) setTrips(tripsData)
            if (Array.isArray(busesData)) setBuses(busesData)
            if (Array.isArray(driversData)) setDrivers(driversData)
            if (Array.isArray(routesData)) setRoutes(routesData)
        } catch (error) {
            console.error("Failed to fetch data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateTrip = async () => {
        setSubmitting(true)
        try {
            const depDateTime = new Date(`${newTrip.departureDate}T${newTrip.departureTime}`)
            const arrDateTime = new Date(`${newTrip.arrivalDate || newTrip.departureDate}T${newTrip.arrivalTime}`)

            const res = await fetch('/api/admin/trips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newTrip,
                    departureTime: depDateTime,
                    arrivalTime: arrDateTime
                })
            })

            if (res.ok) {
                fetchData()
                setNewTrip({
                    routeId: "",
                    busId: "",
                    driverId: "",
                    departureTime: "",
                    departureDate: "",
                    arrivalTime: "",
                    arrivalDate: "",
                    basePrice: "1500"
                })
            }
        } catch (error) {
            console.error("Failed to create trip:", error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Schedule Management</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Schedule Form */}
                <Card className="lg:col-span-1 shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl">
                        <CardTitle className="text-lg">Assign New Trip</CardTitle>
                        <CardDescription>Schedule a bus for a specific route.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="space-y-2">
                            <Label className="text-slate-600">Route</Label>
                            <Select value={newTrip.routeId} onValueChange={v => setNewTrip({ ...newTrip, routeId: v })}>
                                <SelectTrigger className="h-11 border-slate-200">
                                    <SelectValue placeholder="Select Route" />
                                </SelectTrigger>
                                <SelectContent>
                                    {routes.map(r => (
                                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                    ))}
                                    {routes.length === 0 && <SelectItem value="none" disabled>No routes found</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-600">Bus</Label>
                            <Select value={newTrip.busId} onValueChange={v => setNewTrip({ ...newTrip, busId: v })}>
                                <SelectTrigger className="h-11 border-slate-200">
                                    <SelectValue placeholder="Select Bus" />
                                </SelectTrigger>
                                <SelectContent>
                                    {buses.map(b => (
                                        <SelectItem key={b.id} value={b.id}>{b.registrationNo} ({b.type})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-600">Dep. Date</Label>
                                <Input
                                    type="date"
                                    className="h-11 border-slate-200"
                                    value={newTrip.departureDate}
                                    onChange={e => setNewTrip({ ...newTrip, departureDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-600">Dep. Time</Label>
                                <Input
                                    type="time"
                                    className="h-11 border-slate-200"
                                    value={newTrip.departureTime}
                                    onChange={e => setNewTrip({ ...newTrip, departureTime: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-600">Arr. Time</Label>
                                <Input
                                    type="time"
                                    className="h-11 border-slate-200"
                                    value={newTrip.arrivalTime}
                                    onChange={e => setNewTrip({ ...newTrip, arrivalTime: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-600">Base Price</Label>
                                <Input
                                    type="number"
                                    className="h-11 border-slate-200"
                                    value={newTrip.basePrice}
                                    onChange={e => setNewTrip({ ...newTrip, basePrice: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-600">Driver</Label>
                            <Select value={newTrip.driverId} onValueChange={v => setNewTrip({ ...newTrip, driverId: v })}>
                                <SelectTrigger className="h-11 border-slate-200">
                                    <SelectValue placeholder="Select Driver" />
                                </SelectTrigger>
                                <SelectContent>
                                    {drivers.map(d => (
                                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-bold mt-2"
                            onClick={handleCreateTrip}
                            disabled={submitting}
                        >
                            {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Plus className="mr-2 h-4 w-4" />}
                            Create Schedule
                        </Button>
                    </CardContent>
                </Card>

                {/* Existing Schedules List */}
                <Card className="lg:col-span-2 shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl">
                        <CardTitle className="text-lg">Active Schedules</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <p className="text-slate-500 font-medium">Loading schedules...</p>
                            </div>
                        ) : trips.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">No trips scheduled yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {trips.map((trip) => (
                                    <div key={trip.id} className="flex items-center justify-between p-5 border border-slate-100 rounded-xl bg-white hover:border-blue-200 transition-colors shadow-sm">
                                        <div className="space-y-2">
                                            <div className="font-bold text-slate-900 flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-blue-500" />
                                                {trip.route.name}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                                <span className="flex items-center gap-1.5"><Bus className="h-3.5 w-3.5" /> {trip.bus.registrationNo}</span>
                                                <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {trip.driver?.name || 'Unassigned'}</span>
                                            </div>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <div className="font-bold text-lg text-blue-600">{format(new Date(trip.departureTime), 'hh:mm a')}</div>
                                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{format(new Date(trip.departureTime), 'MMM dd, yyyy')}</div>
                                            <div className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-black inline-block">LKR {trip.basePrice}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
