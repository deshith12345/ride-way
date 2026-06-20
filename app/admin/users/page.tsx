
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
import { MoreHorizontal, Search, Users, Loader2, Shield, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"

export default function AdminUsersPage() {
    const { data: session } = useSession()
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState("ALL")
    const [selectedUser, setSelectedUser] = useState<any>(null)
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
                            <TableHead className="font-bold">Bookings</TableHead>
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
                                <TableCell className="font-medium text-slate-600">{user._count?.bookings || 0}</TableCell>
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
