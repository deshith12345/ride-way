
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { MoreHorizontal, Plus, Search, Map, Loader2, Route as RouteIcon, Trash2, Ticket } from "lucide-react"
import Link from "next/link"

export default function RoutesPage() {
    const [routes, setRoutes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedRoute, setSelectedRoute] = useState<any>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [actionError, setActionError] = useState("")
    const [newRoute, setNewRoute] = useState({
        name: "",
        origin: "",
        destination: "",
        totalDistance: "",
        estimatedDuration: ""
    })

    useEffect(() => {
        fetchRoutes()
    }, [])

    const fetchRoutes = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/routes')
            const data = await res.json()
            if (Array.isArray(data)) setRoutes(data)
        } catch (error) {
            console.error("Failed to fetch routes:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddRoute = async () => {
        setSubmitting(true)
        setActionError("")
        try {
            const res = await fetch('/api/admin/routes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newRoute,
                    totalDistance: parseFloat(newRoute.totalDistance),
                    estimatedDuration: parseInt(newRoute.estimatedDuration)
                })
            })
            if (res.ok) {
                setIsAddModalOpen(false)
                await fetchRoutes()
                setNewRoute({
                    name: "",
                    origin: "",
                    destination: "",
                    totalDistance: "",
                    estimatedDuration: ""
                })
            } else {
                const data = await res.json()
                setActionError(data.error || "Failed to add route")
            }
        } catch (error) {
            console.error("Failed to add route:", error)
            setActionError("Failed to add route")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteRoute = async () => {
        if (!selectedRoute) return
        setSubmitting(true)
        setActionError("")

        try {
            const res = await fetch(`/api/admin/routes/${selectedRoute.id}`, { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to delete route")

            setShowDeleteDialog(false)
            setSelectedRoute(null)
            await fetchRoutes()
        } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to delete route")
        } finally {
            setSubmitting(false)
        }
    }

    const filteredRoutes = routes.filter((route) => {
        const query = searchQuery.trim().toLowerCase()
        return !query ||
            route.name?.toLowerCase().includes(query) ||
            route.origin?.toLowerCase().includes(query) ||
            route.destination?.toLowerCase().includes(query)
    })

    const formatDuration = (minutes?: number | null) => {
        if (!minutes) return "Not set"
        return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Route Management</h1>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 h-11 px-6 rounded-xl font-bold">
                            <Plus className="mr-2 h-4 w-4" /> Create New Route
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Route</DialogTitle>
                            <DialogDescription>Define a new travel path between cities.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {actionError && (
                                <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                                    {actionError}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label>Route Name</Label>
                                <Input
                                    placeholder="e.g. Colombo - Kandy"
                                    value={newRoute.name}
                                    onChange={e => setNewRoute({ ...newRoute, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Origin City</Label>
                                    <Input
                                        placeholder="Colombo"
                                        value={newRoute.origin}
                                        onChange={e => setNewRoute({ ...newRoute, origin: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Destination City</Label>
                                    <Input
                                        placeholder="Kandy"
                                        value={newRoute.destination}
                                        onChange={e => setNewRoute({ ...newRoute, destination: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Distance (KM)</Label>
                                    <Input
                                        type="number"
                                        placeholder="115"
                                        value={newRoute.totalDistance}
                                        onChange={e => setNewRoute({ ...newRoute, totalDistance: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Est. Duration (Min)</Label>
                                    <Input
                                        type="number"
                                        placeholder="210"
                                        value={newRoute.estimatedDuration}
                                        onChange={e => setNewRoute({ ...newRoute, estimatedDuration: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddRoute} disabled={submitting} className="bg-blue-600">
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Route
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search routes..."
                        className="pl-8 h-11"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />
                </div>
            </div>

            {actionError && !isAddModalOpen && (
                <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                    {actionError}
                </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="font-bold">Route Name</TableHead>
                            <TableHead className="font-bold">Origin</TableHead>
                            <TableHead className="font-bold">Destination</TableHead>
                            <TableHead className="font-bold">Distance</TableHead>
                            <TableHead className="font-bold">Duration</TableHead>
                            <TableHead className="text-right font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                                </TableCell>
                            </TableRow>
                        ) : filteredRoutes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <div className="flex flex-col items-center gap-2 text-slate-500">
                                        <RouteIcon className="h-10 w-10 text-slate-300" />
                                        <p className="font-medium">No routes defined yet.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredRoutes.map((route) => (
                            <TableRow key={route.id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="font-bold text-slate-900 flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Map className="h-4 w-4 text-blue-600" />
                                    </div>
                                    {route.name}
                                </TableCell>
                                <TableCell className="font-medium">{route.origin}</TableCell>
                                <TableCell className="font-medium">{route.destination}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold">{route.totalDistance ? `${route.totalDistance} KM` : "Not set"}</Badge>
                                </TableCell>
                                <TableCell className="font-medium text-slate-500">
                                    {formatDuration(route.estimatedDuration)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <Link href={`/search?from=${encodeURIComponent(route.origin)}&to=${encodeURIComponent(route.destination)}`}>
                                                <DropdownMenuItem>
                                                    <Ticket className="mr-2 h-4 w-4" /> View Trips
                                                </DropdownMenuItem>
                                            </Link>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => {
                                                    setSelectedRoute(route)
                                                    setShowDeleteDialog(true)
                                                }}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Route
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Route</DialogTitle>
                        <DialogDescription>
                            Delete {selectedRoute?.name}? Routes with scheduled trips cannot be removed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleDeleteRoute} disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete Route
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
