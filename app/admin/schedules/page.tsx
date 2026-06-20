"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Bus, CalendarIcon, Loader2, MapPin, Pencil, Plus, Save, Trash2, User, X } from "lucide-react"
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

const tripStatuses = ["SCHEDULED", "BOARDING", "DEPARTED", "IN_TRANSIT", "ARRIVED", "COMPLETED", "CANCELLED", "DELAYED"]

const emptyTripForm = {
    routeId: "",
    busId: "",
    driverId: "",
    departureTime: "",
    departureDate: "",
    arrivalTime: "",
    arrivalDate: "",
    basePrice: "1500",
    status: "SCHEDULED",
}

function toDateInputValue(value: string | Date) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-")
}

function toTimeInputValue(value: string | Date) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""

    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}

export default function SchedulePage() {
    const [trips, setTrips] = useState<any[]>([])
    const [buses, setBuses] = useState<any[]>([])
    const [drivers, setDrivers] = useState<any[]>([])
    const [routes, setRoutes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [deletingTripId, setDeletingTripId] = useState<string | null>(null)
    const [editingTripId, setEditingTripId] = useState<string | null>(null)
    const [formError, setFormError] = useState("")

    const [newTrip, setNewTrip] = useState(emptyTripForm)

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

    const resetForm = () => {
        setNewTrip(emptyTripForm)
        setEditingTripId(null)
        setFormError("")
    }

    const handleEditTrip = (trip: any) => {
        setEditingTripId(trip.id)
        setFormError("")
        setNewTrip({
            routeId: trip.routeId,
            busId: trip.busId,
            driverId: trip.driverId || "",
            departureDate: toDateInputValue(trip.departureTime),
            departureTime: toTimeInputValue(trip.departureTime),
            arrivalDate: toDateInputValue(trip.arrivalTime),
            arrivalTime: toTimeInputValue(trip.arrivalTime),
            basePrice: String(trip.basePrice),
            status: trip.status || "SCHEDULED",
        })
    }

    const handleSaveTrip = async () => {
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
            const endpoint = editingTripId ? `/api/trips/${editingTripId}` : "/api/admin/trips"
            const response = await fetch(endpoint, {
                method: editingTripId ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newTrip,
                    driverId: newTrip.driverId || null,
                    departureTime: departureDateTime,
                    arrivalTime: arrivalDateTime,
                }),
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || `Failed to ${editingTripId ? "update" : "create"} schedule`)

            await fetchData()
            resetForm()
        } catch (error) {
            console.error("Failed to save trip:", error)
            setFormError(error instanceof Error ? error.message : "Failed to save schedule")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteTrip = async (trip: any) => {
        const routeName = trip.route?.name || "this route"
        if (!window.confirm(`Delete the schedule for ${routeName}? Related bookings and tickets for this schedule will also be removed.`)) return

        setDeletingTripId(trip.id)
        try {
            const response = await fetch(`/api/trips/${trip.id}`, {
                method: "DELETE",
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Failed to delete schedule")

            if (editingTripId === trip.id) resetForm()
            await fetchData()
        } catch (error) {
            console.error("Failed to delete trip:", error)
            alert(error instanceof Error ? error.message : "Failed to delete schedule")
        } finally {
            setDeletingTripId(null)
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
                        <CardTitle className="text-lg">{editingTripId ? "Edit Schedule" : "Assign New Trip"}</CardTitle>
                        <CardDescription>{editingTripId ? "Change route, bus, driver, time, price, or status." : "Schedule a bus for a specific route."}</CardDescription>
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
                            <Select value={newTrip.driverId || "__UNASSIGNED__"} onValueChange={(value) => setNewTrip({ ...newTrip, driverId: value === "__UNASSIGNED__" ? "" : value })}>
                                <SelectTrigger className="h-11 border-slate-200">
                                    <SelectValue placeholder="Select Driver" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__UNASSIGNED__">Unassigned</SelectItem>
                                    {drivers.map((driver) => (
                                        <SelectItem key={driver.id} value={driver.id}>{driver.name || driver.email}</SelectItem>
                                    ))}
                                    {drivers.length === 0 && <SelectItem value="none" disabled>No drivers found</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>

                        {editingTripId && (
                            <div className="space-y-2">
                                <Label className="text-slate-600">Status</Label>
                                <Select value={newTrip.status} onValueChange={(value) => setNewTrip({ ...newTrip, status: value })}>
                                    <SelectTrigger className="h-11 border-slate-200">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tripStatuses.map((status) => (
                                            <SelectItem key={status} value={status}>{status.replace(/_/g, " ")}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="flex gap-3">
                            {editingTripId && (
                                <Button variant="outline" className="mt-2 h-12 flex-1 rounded-xl font-bold" onClick={resetForm} disabled={submitting}>
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                </Button>
                            )}
                            <Button className="mt-2 h-12 flex-1 rounded-xl bg-blue-600 font-bold hover:bg-blue-700" onClick={handleSaveTrip} disabled={submitting}>
                                {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : editingTripId ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                                {editingTripId ? "Save Schedule" : "Create Schedule"}
                            </Button>
                        </div>
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
                                                <span className="rounded bg-slate-100 px-2 py-0.5 font-black text-slate-500">{trip.status?.replace(/_/g, " ")}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="space-y-1 text-right">
                                                <div className="text-lg font-bold text-blue-600">{format(new Date(trip.departureTime), "hh:mm a")}</div>
                                                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{format(new Date(trip.departureTime), "MMM dd, yyyy")}</div>
                                                <div className="inline-block rounded bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-600">LKR {trip.basePrice}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" className="h-10 rounded-xl font-bold" onClick={() => handleEditTrip(trip)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Button>
                                                <Button variant="destructive" className="h-10 rounded-xl font-bold" onClick={() => handleDeleteTrip(trip)} disabled={deletingTripId === trip.id}>
                                                    {deletingTripId === trip.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                                    Delete
                                                </Button>
                                            </div>
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
