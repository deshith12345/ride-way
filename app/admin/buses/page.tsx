
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Plus, Search, Filter, Loader2, Upload, Trash2 } from "lucide-react"

export default function BusFleetPage() {
    const [buses, setBuses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newBus, setNewBus] = useState({
        registrationNo: "",
        number: "",
        type: "AC",
        totalSeats: "45",
        amenities: [] as string[],
        images: [] as string[]
    })
    const [isUploading, setIsUploading] = useState(false)

    useEffect(() => {
        fetchBuses()
    }, [])

    const fetchBuses = async () => {
        try {
            const res = await fetch('/api/admin/buses')
            const data = await res.json()
            if (Array.isArray(data)) setBuses(data)
        } catch (error) {
            console.error("Failed to fetch buses:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            const data = await res.json()
            if (data.url) {
                setNewBus(prev => ({ ...prev, images: [...prev.images, data.url] }))
            }
        } catch (error) {
            console.error("Upload failed:", error)
        } finally {
            setIsUploading(false)
        }
    }

    const handleAddBus = async () => {
        try {
            const res = await fetch('/api/admin/buses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBus)
            })
            if (res.ok) {
                setIsAddModalOpen(false)
                fetchBuses()
                setNewBus({
                    registrationNo: "",
                    number: "",
                    type: "AC",
                    totalSeats: "45",
                    amenities: [],
                    images: []
                })
            }
        } catch (error) {
            console.error("Failed to add bus:", error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Bus Fleet</h1>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> Add New Bus
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add New Bus</DialogTitle>
                            <DialogDescription>Enter the details for the new bus in your fleet.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Reg No</Label>
                                    <Input
                                        placeholder="WP-1234"
                                        value={newBus.registrationNo}
                                        onChange={e => setNewBus({ ...newBus, registrationNo: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Display Number</Label>
                                    <Input
                                        placeholder="B-001"
                                        value={newBus.number}
                                        onChange={e => setNewBus({ ...newBus, number: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select value={newBus.type} onValueChange={v => setNewBus({ ...newBus, type: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AC">AC</SelectItem>
                                            <SelectItem value="NON_AC">Non-AC</SelectItem>
                                            <SelectItem value="LUXURY">Luxury</SelectItem>
                                            <SelectItem value="SUPER_LUXURY">Super Luxury</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Seat Capacity</Label>
                                    <Input
                                        type="number"
                                        value={newBus.totalSeats}
                                        onChange={e => setNewBus({ ...newBus, totalSeats: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Bus Image</Label>
                                <div className="flex items-center gap-4">
                                    {newBus.images.length > 0 && (
                                        <div className="relative h-12 w-12 rounded overflow-hidden border">
                                            <img src={newBus.images[0]} className="h-full w-full object-cover" />
                                            <button
                                                onClick={() => setNewBus({ ...newBus, images: [] })}
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                    <Label className="flex-1 border-2 border-dashed rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors h-12">
                                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 text-slate-400" />}
                                    </Label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddBus} className="bg-blue-600">Register Bus</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input placeholder="Search buses..." className="pl-8" />
                </div>
                <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
            </div>

            <div className="rounded-md border bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Bus Number</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Seats</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                                </TableCell>
                            </TableRow>
                        ) : buses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500 font-medium">
                                    No buses found in fleet.
                                </TableCell>
                            </TableRow>
                        ) : buses.map((bus) => (
                            <TableRow key={bus.id} className="hover:bg-slate-50/50">
                                <TableCell className="font-bold text-slate-900">{bus.registrationNo}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold">{bus.type}</Badge>
                                </TableCell>
                                <TableCell className="font-medium">{bus.totalSeats}</TableCell>
                                <TableCell className="text-slate-500 text-sm">{new Date(bus.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 font-bold">
                                        Active
                                    </Badge>
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
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                            <DropdownMenuItem>Edit Configuration</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">Delete Bus</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
