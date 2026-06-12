
"use client"

import { signOut } from "next-auth/react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { User, LogOut, LayoutDashboard, Settings } from "lucide-react"
import Link from "next/link"

interface UserMenuProps {
    user: {
        name?: string | null
        email?: string | null
        image?: string | null
        role?: string
    }
}

export default function UserMenu({ user }: UserMenuProps) {
    const initials = user.name
        ? user.name.split(" ").map(n => n[0]).join("").toUpperCase()
        : user.email?.[0].toUpperCase() || "U"

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-blue-50 border border-blue-100 p-0 hover:bg-blue-100 transition-all border-2 border-transparent hover:border-blue-200">
                    <div className="flex h-full w-full items-center justify-center text-sm font-black text-blue-600">
                        {user.image ? (
                            <img src={user.image} alt={user.name || "User"} className="h-full w-full rounded-full object-cover" />
                        ) : (
                            <span>{initials}</span>
                        )}
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mt-2 rounded-2xl p-2 soft-shadow border-slate-100" align="end">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1 p-2">
                        <p className="text-sm font-black text-slate-900 leading-none">{user.name}</p>
                        <p className="text-xs font-medium text-slate-500 truncate">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-50" />
                <Link href="/dashboard">
                    <DropdownMenuItem className="rounded-xl p-3 font-bold text-slate-600 flex items-center gap-2 cursor-pointer focus:bg-blue-50 focus:text-blue-600">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </DropdownMenuItem>
                </Link>
                <Link href="/settings">
                    <DropdownMenuItem className="rounded-xl p-3 font-bold text-slate-600 flex items-center gap-2 cursor-pointer focus:bg-blue-50 focus:text-blue-600">
                        <Settings className="h-4 w-4" />
                        Account Settings
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-slate-50" />
                <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="rounded-xl p-3 font-bold text-rose-600 flex items-center gap-2 cursor-pointer focus:bg-rose-50 focus:text-rose-700"
                >
                    <LogOut className="h-4 w-4" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
