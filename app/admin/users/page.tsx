
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
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarDays, CreditCard, Eye, Mail, MoreHorizontal, Phone, Route, Search, Users, Loader2, Shield, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"

export default function AdminUsersPage() {
    const { data: session } = useSession()
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState("ALL")
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [showDetailsDialog, setShowDetailsDialog] = useState(false)
    const [showRoleDialog, setShowRoleDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
    const [newRole, setNewRole] = useState("")
    const [actionLoading, setActionLoading] = useState(false)
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

    const currentAdminId = session?.user?.id
    const selectableUserIds = users
        .filter((user) => user.id !== currentAdminId)
        .map((user) => user.id)
    const allSelectableSelected =
        selectableUserIds.length > 0 &&
        selectableUserIds.every((id) => selectedUserIds.includes(id))

    useEffect(() => {
        fetchUsers()
    }, [searchQuery, roleFilter])

    useEffect(() => {
        setSelectedUserIds((current) => current.filter((id) => selectableUserIds.includes(id)))
    }, [users, currentAdminId])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (searchQuery) params.set('search', searchQuery)
            if (roleFilter && roleFilter !== 'ALL') params.set('role', roleFilter)

            const res = await fetch(`/api/admin/users?${params.toString()}`)
            const data = await res.json()
            if (Array.isArray(data)) setUsers(data)
        } catch (error) {
            console.error("Failed to fetch users:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = async () => {
        if (!selectedUser || !newRole) return
        setActionLoading(true)
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            })
            if (res.ok) {
                setShowRoleDialog(false)
                fetchUsers()
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to update role')
            }
        } catch (error) {
            console.error("Failed to update role:", error)
        } finally {
            setActionLoading(false)
        }
    }

    const handleDeleteUser = async () => {
        if (!selectedUser) return
        setActionLoading(true)
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                setShowDeleteDialog(false)
                fetchUsers()
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to delete user')
            }
        } catch (error) {
            console.error("Failed to delete user:", error)
        } finally {
            setActionLoading(false)
        }
    }

    const toggleUserSelection = (userId: string, checked: boolean) => {
        if (userId === currentAdminId) return

        setSelectedUserIds((current) => {
            if (checked) return Array.from(new Set([...current, userId]))
            return current.filter((id) => id !== userId)
        })
    }

    const toggleAllSelectableUsers = (checked: boolean) => {
        setSelectedUserIds(checked ? selectableUserIds : [])
    }

    const handleBulkDeleteUsers = async () => {
        if (selectedUserIds.length === 0) return
        setActionLoading(true)
        try {
            const res = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedUserIds })
            })
            const data = await res.json()
            if (res.ok) {
                setSelectedUserIds([])
                setShowBulkDeleteDialog(false)
                fetchUsers()
            } else {
                alert(data.error || 'Failed to delete selected users')
            }
        } catch (error) {
            console.error("Failed to delete selected users:", error)
        } finally {
            setActionLoading(false)
        }
    }

    const roleBadge = (role: string) => {
        const styles: Record<string, string> = {
            ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
            DRIVER: "bg-blue-100 text-blue-700 border-blue-200",
            TRAVELLER: "bg-emerald-100 text-emerald-700 border-emerald-200",
        }
        return (
            <Badge className={`${styles[role] || "bg-slate-100 text-slate-600"} font-bold border`}>
                {role}
            </Badge>
        )
    }

    const formatDate = (value?: string) => {
        if (!value) return "--"
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return "--"
        return date.toLocaleString()
    }

    const formatCurrency = (value?: number | null, currency = "LKR") => {
        if (typeof value !== "number") return "--"
        return `${currency} ${value.toLocaleString()}`
    }

    const statusBadge = (status?: string) => (
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">
            {(status || "UNKNOWN").replace(/_/g, " ")}
        </span>
    )

    const openDetails = (user: any) => {
        setSelectedUser(user)
        setShowDetailsDialog(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
                    <p className="text-slate-500 mt-1">Manage all registered users and their roles.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
                    <Users className="h-5 w-5 text-slate-500" />
                    <span className="text-sm font-bold text-slate-700">{users.length} users</span>
                </div>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search by name or email..."
                        className="pl-8 h-11"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-40 h-11">
                        <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Roles</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="DRIVER">Driver</SelectItem>
                        <SelectItem value="TRAVELLER">Traveller</SelectItem>
                    </SelectContent>
                </Select>
                </div>
                <div className="flex items-center justify-end gap-3">
                    <span className="text-sm font-bold text-slate-500">
                        {selectedUserIds.length} selected
                    </span>
                    <Button
                        variant="destructive"
                        className="h-11 rounded-xl font-bold"
                        disabled={selectedUserIds.length === 0 || actionLoading}
                        onClick={() => setShowBulkDeleteDialog(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Selected
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={allSelectableSelected}
                                    disabled={selectableUserIds.length === 0}
                                    onCheckedChange={(checked) => toggleAllSelectableUsers(Boolean(checked))}
                                    aria-label="Select all users except current admin"
                                />
                            </TableHead>
                            <TableHead className="font-bold">User</TableHead>
                            <TableHead className="font-bold">Email</TableHead>
                            <TableHead className="font-bold">Role</TableHead>
                            <TableHead className="font-bold">Activity</TableHead>
                            <TableHead className="font-bold">Joined</TableHead>
                            <TableHead className="text-right font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center">
                                    <div className="flex flex-col items-center gap-2 text-slate-500">
                                        <Users className="h-10 w-10 text-slate-300" />
                                        <p className="font-medium">No users found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : users.map((user) => (
                            <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell>
                                    <Checkbox
                                        checked={selectedUserIds.includes(user.id)}
                                        disabled={user.id === currentAdminId}
                                        onCheckedChange={(checked) => toggleUserSelection(user.id, Boolean(checked))}
                                        aria-label={`Select ${user.name || user.email}`}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                                            {user.image ? (
                                                <img src={user.image} alt="" className="h-full w-full rounded-full object-cover" />
                                            ) : (
                                                user.name?.[0]?.toUpperCase() || "U"
                                            )}
                                        </div>
                                        <span className="font-bold text-slate-900">{user.name || "—"}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-500 font-medium">{user.email}</TableCell>
                                <TableCell>{roleBadge(user.role)}</TableCell>
                                <TableCell>
                                    <div className="space-y-1 text-sm font-bold text-slate-600">
                                        <div>{user._count?.bookings || 0} bookings</div>
                                        <div>{user._count?.assignedTrips || 0} assigned trips</div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-500 text-sm">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => openDetails(user)}>
                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => {
                                                setSelectedUser(user)
                                                setNewRole(user.role)
                                                setShowRoleDialog(true)
                                            }}>
                                                <Shield className="mr-2 h-4 w-4" /> Change Role
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                disabled={user.id === currentAdminId}
                                                onClick={() => {
                                                    setSelectedUser(user)
                                                    setShowDeleteDialog(true)
                                                }}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete User
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* User Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-h-[85vh] max-w-5xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <span>{selectedUser?.name || selectedUser?.email || "User details"}</span>
                            {selectedUser?.role && roleBadge(selectedUser.role)}
                        </DialogTitle>
                        <DialogDescription>
                            Profile, current trips, traveller bookings, and payment details.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="space-y-6">
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-lg border border-slate-200 p-4">
                                    <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase text-slate-400">
                                        <Mail className="h-3.5 w-3.5" /> Email
                                    </div>
                                    <div className="break-all text-sm font-bold text-slate-900">{selectedUser.email}</div>
                                </div>
                                <div className="rounded-lg border border-slate-200 p-4">
                                    <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase text-slate-400">
                                        <Phone className="h-3.5 w-3.5" /> Phone
                                    </div>
                                    <div className="text-sm font-bold text-slate-900">{selectedUser.phone || "--"}</div>
                                </div>
                                <div className="rounded-lg border border-slate-200 p-4">
                                    <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase text-slate-400">
                                        <CalendarDays className="h-3.5 w-3.5" /> Joined
                                    </div>
                                    <div className="text-sm font-bold text-slate-900">{formatDate(selectedUser.createdAt)}</div>
                                </div>
                                <div className="rounded-lg border border-slate-200 p-4">
                                    <div className="mb-1 text-xs font-black uppercase text-slate-400">Profile</div>
                                    <div className="text-sm font-bold text-slate-900">
                                        {selectedUser.emailVerified ? "Email verified" : "Email not verified"}
                                    </div>
                                </div>
                            </div>

                            {selectedUser.role === "DRIVER" && (
                                <div className="grid gap-3 md:grid-cols-3">
                                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                                        <div className="text-xs font-black uppercase text-blue-500">License number</div>
                                        <div className="mt-1 text-sm font-bold text-slate-900">{selectedUser.licenseNumber || "--"}</div>
                                    </div>
                                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                                        <div className="text-xs font-black uppercase text-blue-500">Driver status</div>
                                        <div className="mt-1 text-sm font-bold text-slate-900">{selectedUser.isVerified ? "Verified" : "Not verified"}</div>
                                    </div>
                                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                                        <div className="text-xs font-black uppercase text-blue-500">Assigned trips</div>
                                        <div className="mt-1 text-sm font-bold text-slate-900">{selectedUser._count?.assignedTrips || 0}</div>
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-6 lg:grid-cols-2">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 font-black text-slate-900">
                                        <Route className="h-4 w-4 text-blue-600" /> Current Driver Trips
                                    </div>
                                    {selectedUser.assignedTrips?.length ? (
                                        <div className="space-y-3">
                                            {selectedUser.assignedTrips.map((trip: any) => (
                                                <div key={trip.id} className="rounded-lg border border-slate-200 p-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <div className="font-bold text-slate-900">{trip.route?.name || "Route"}</div>
                                                            <div className="mt-1 text-sm text-slate-500">{trip.bus?.registrationNo || "No bus"} / {trip.bus?.type || "Bus"}</div>
                                                        </div>
                                                        {statusBadge(trip.status)}
                                                    </div>
                                                    <div className="mt-3 grid gap-2 text-xs font-bold text-slate-500 md:grid-cols-2">
                                                        <div>Departure: {formatDate(trip.departureTime)}</div>
                                                        <div>Arrival: {formatDate(trip.arrivalTime)}</div>
                                                        <div>Bookings: {trip._count?.bookings || 0}</div>
                                                        <div>Price: {formatCurrency(trip.basePrice)}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm font-bold text-slate-400">
                                            No assigned trips found.
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 font-black text-slate-900">
                                        <CreditCard className="h-4 w-4 text-emerald-600" /> Traveller Bookings & Payments
                                    </div>
                                    {selectedUser.bookings?.length ? (
                                        <div className="space-y-3">
                                            {selectedUser.bookings.map((booking: any) => (
                                                <div key={booking.id} className="rounded-lg border border-slate-200 p-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <div className="font-bold text-slate-900">{booking.trip?.route?.name || "Route"}</div>
                                                            <div className="mt-1 text-sm text-slate-500">{booking._count?.tickets || 0} tickets / {formatCurrency(booking.totalAmount)}</div>
                                                        </div>
                                                        {statusBadge(booking.status)}
                                                    </div>
                                                    <div className="mt-3 grid gap-2 text-xs font-bold text-slate-500 md:grid-cols-2">
                                                        <div>Booked: {formatDate(booking.bookingDate || booking.createdAt)}</div>
                                                        <div>Trip: {formatDate(booking.trip?.departureTime)}</div>
                                                        <div>Payment: {booking.payment?.status || booking.paymentStatus || "PENDING"}</div>
                                                        <div>Method: {booking.payment?.method || "--"}</div>
                                                        <div>Paid: {formatCurrency(booking.payment?.amount, booking.payment?.currency || "LKR")}</div>
                                                        <div>Bus: {booking.trip?.bus?.registrationNo || "--"}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm font-bold text-slate-400">
                                            No traveller bookings found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Change Role Dialog */}
            <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change User Role</DialogTitle>
                        <DialogDescription>
                            Update the role for <strong>{selectedUser?.name || selectedUser?.email}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <Select value={newRole} onValueChange={setNewRole}>
                        <SelectTrigger className="h-11">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="DRIVER">Driver</SelectItem>
                            <SelectItem value="TRAVELLER">Traveller</SelectItem>
                        </SelectContent>
                    </Select>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRoleDialog(false)}>Cancel</Button>
                        <Button
                            onClick={handleRoleChange}
                            disabled={actionLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Role
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete User Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{selectedUser?.name || selectedUser?.email}</strong>? This action cannot be undone and will remove all their data.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteUser}
                            disabled={actionLoading}
                        >
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Users Dialog */}
            <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Selected Users</DialogTitle>
                        <DialogDescription>
                            Delete {selectedUserIds.length} selected user{selectedUserIds.length === 1 ? "" : "s"}? Your current admin account is excluded and cannot be deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowBulkDeleteDialog(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleBulkDeleteUsers}
                            disabled={actionLoading || selectedUserIds.length === 0}
                        >
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete Selected
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
