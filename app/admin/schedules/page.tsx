"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Bus, CalendarIcon, Loader2, MapPin, Plus, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function SchedulePage() {
    const [trips, setTrips] = useState<any[]>([])
    const [buses, setBuses] = useState<any[]>([])
    const [drivers, setDrivers] = useState<any[]>([])
    const [routes, setRoutes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [formError, setFormError] = useState("")

    const [newTrip, setNewTrip] = useState({
        routeId: "",
        busId: "",
        driverId: "",
        departureTime: "",
        departureDate: "",
        arrivalTime: "",
        arrivalDate: "",
        basePrice: "1500",
    })

    const fetchData = async () => {
        try {
            setLoading(true)
            const [tripsRes, busesRes, driversRes, routesRes] = await Promise.all([
                fetch("/api/admin/trips"),
                fetch("/api/admin/buses"),
                fetch("/api/admin/drivers"),
                fetch("/api/admin/routes"),
            ])

            const [tripsData, busesData, driversData, routesData] = await Promise.all([
                tripsRes.json(),
                busesRes.json(),
                driversRes.json(),
                routesRes.json(),
            ])

            if (Array.isArray(tripsData)) setTrips(tripsData)
            if (Array.isArray(busesData)) setBuses(busesData)
            if (Array.isArray(driversData)) setDrivers(driversData)
            if (Array.isArray(routesData)) setRoutes(routesData)
        } catch (error) {
            console.error("Failed to fetch schedule data:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleCreateTrip = async () => {
        setFormError("")

        if (!newTrip.routeId || !newTrip.busId || !newTrip.departureDate || !newTrip.departureTime || !newTrip.arrivalDate || !newTrip.arrivalTime) {
            setFormError("Select route, bus, departure, and arrival details before creating a schedule.")
            return
        }

        if (!Number.isFinite(Number(newTrip.basePrice)) || Number(newTrip.basePrice) <= 0) {
            setFormError("Base price must be a positive number.")
            return
        }

        const departureDateTime = new Date(`${newTrip.departureDate}T${newTrip.departureTime}`)
        const arrivalDateTime = new Date(`${newTrip.arrivalDate}T${newTrip.arrivalTime}`)

        if (arrivalDateTime <= departureDateTime) {
            setFormError("Arrival must be after departure.")
            return
        }

        setSubmitting(true)
        try {
            const response = await fetch("/api/admin/trips", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newTrip,
                    departureTime: departureDateTime,
                    arrivalTime: arrivalDateTime,
                }),
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Failed to create schedule")

            await fetchData()
            setNewTrip({
                routeId: "",
                busId: "",
                driverId: "",
                departureTime: "",
                departureDate: "",
                arrivalTime: "",
                arrivalDate: "",
                basePrice: "1500",
            })
        } catch (error) {
            console.error("Failed to create trip:", error)
            setFormError(error instanceof Error ? error.message : "Failed to create schedule")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Schedule Management</h1>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <Card className="border-slate-200 shadow-sm lg:col-span-1">
                    <CardHeader className="rounded-t-xl border-b border-slate-100 bg-slate-50">
                        <CardTitle className="text-lg">Assign New Trip</CardTitle>
                        <CardDescription>Schedule a bus for a specific route.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        {formError && (
                            <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                                {formError}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-slate-600">Route</Label>
                            <Select value={newTrip.routeId} onValueChange={(value) => setNewTrip({ ...newTrip, routeId: value })}>
                                <SelectTrigger className="h-11 border-slate-200">
                                    <SelectValue placeholder="Select Route" />
                                </SelectTrigger>
                                <SelectContent>
                                    {routes.map((route) => (
                                        <SelectItem key={route.id} value={route.id}>{route.name}</SelectItem>
                                    ))}
                                    {routes.length === 0 && <SelectItem value="none" disabled>No routes found</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-600">Bus</Label>
                            <Select value={newTrip.busId} onValueChange={(value) => setNewTrip({ ...newTrip, busId: value })}>
                                <SelectTrigger className="h-11 border-slate-200">
                                    <SelectValue placeholder="Select Bus" />
                                </SelectTrigger>
                                <SelectContent>
                                    {buses.map((bus) => (
                                        <SelectItem key={bus.id} value={bus.id}>{bus.registrationNo} ({bus.type})</SelectItem>
                                    ))}
                                    {buses.length === 0 && <SelectItem value="none" disabled>No buses found</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-600">Dep. Date</Label>
                                <Input type="date" className="h-11 border-slate-200" value={newTrip.departureDate} onChange={(event) => setNewTrip({ ...newTrip, departureDate: event.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-600">Dep. Time</Label>
                                <Input type="time" className="h-11 border-slate-200" value={newTrip.departureTime} onChange={(event) => setNewTrip({ ...newTrip, departureTime: event.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-600">Arr. Date</Label>
                                <Input type="date" className="h-11 border-slate-200" value={newTrip.arrivalDate} onChange={(event) => setNewTrip({ ...newTrip, arrivalDate: event.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-600">Arr. Time</Label>
                                <Input type="time" className="h-11 border-slate-200" value={newTrip.arrivalTime} onChange={(event) => setNewTrip({ ...newTrip, arrivalTime: event.target.value })} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-600">Base Price</Label>
                            <Input type="number" min="1" className="h-11 border-slate-200" value={newTrip.basePrice} onChange={(event) => setNewTrip({ ...newTrip, basePrice: event.target.value })} />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-600">Driver</Label>
                            <Select value={newTrip.driverId} onValueChange={(value) => setNewTrip({ ...newTrip, driverId: value })}>
                                <SelectTrigger className="h-11 border-slate-200">
                                    <SelectValue placeholder="Select Driver" />
                                </SelectTrigger>
                                <SelectContent>
                                    {drivers.map((driver) => (
                                        <SelectItem key={driver.id} value={driver.id}>{driver.name || driver.email}</SelectItem>
                                    ))}
                                    {drivers.length === 0 && <SelectItem value="none" disabled>No drivers found</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button className="mt-2 h-12 w-full rounded-xl bg-blue-600 font-bold hover:bg-blue-700" onClick={handleCreateTrip} disabled={submitting}>
                            {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Create Schedule
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm lg:col-span-2">
                    <CardHeader className="rounded-t-xl border-b border-slate-100 bg-slate-50">
                        <CardTitle className="text-lg">Active Schedules</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center space-y-4 py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <p className="font-medium text-slate-500">Loading schedules...</p>
                            </div>
                        ) : trips.length === 0 ? (
                            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-12 text-center">
                                <CalendarIcon className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                                <p className="font-medium text-slate-500">No trips scheduled yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {trips.map((trip) => (
                                    <div key={trip.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-colors hover:border-blue-200">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 font-bold text-slate-900">
                                                <MapPin className="h-4 w-4 text-blue-500" />
                                                {trip.route.name}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                                                <span className="flex items-center gap-1.5"><Bus className="h-3.5 w-3.5" /> {trip.bus.registrationNo}</span>
                                                <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {trip.driver?.name || "Unassigned"}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <div className="text-lg font-bold text-blue-600">{format(new Date(trip.departureTime), "hh:mm a")}</div>
                                            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{format(new Date(trip.departureTime), "MMM dd, yyyy")}</div>
                                            <div className="inline-block rounded bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-600">LKR {trip.basePrice}</div>
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
