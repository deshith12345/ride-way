
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
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { MoreHorizontal, Plus, Search, Map, Loader2, Route as RouteIcon } from "lucide-react"

export default function RoutesPage() {
    const [routes, setRoutes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
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
                fetchRoutes()
                setNewRoute({
                    name: "",
                    origin: "",
                    destination: "",
                    totalDistance: "",
                    estimatedDuration: ""
                })
            }
        } catch (error) {
            console.error("Failed to add route:", error)
        }
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
                            <Button onClick={handleAddRoute} className="bg-blue-600">Create Route</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input placeholder="Search routes..." className="pl-8 h-11" />
                </div>
            </div>

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
                        ) : routes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <div className="flex flex-col items-center gap-2 text-slate-500">
                                        <RouteIcon className="h-10 w-10 text-slate-300" />
                                        <p className="font-medium">No routes defined yet.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : routes.map((route) => (
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
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold">{route.totalDistance} KM</Badge>
                                </TableCell>
                                <TableCell className="font-medium text-slate-500">
                                    {Math.floor(route.estimatedDuration / 60)}h {route.estimatedDuration % 60}m
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
