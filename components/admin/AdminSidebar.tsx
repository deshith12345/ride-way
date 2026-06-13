
"use client"

import { cn } from "@/lib/utils"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    Bus,
    Route,
    Calendar,
    Users,
    Settings,
    MessageCircle,
    LogOut,
    ShieldCheck,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const sidebarItems = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Buses", href: "/admin/buses", icon: Bus },
    { name: "Routes", href: "/admin/routes", icon: Route },
    { name: "Schedules", href: "/admin/schedules", icon: Calendar },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Support", href: "/admin/support", icon: MessageCircle },
    { name: "Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminSidebar() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [collapsed, setCollapsed] = useState(false)

    const user = session?.user
    const initials = user?.name
        ? user.name.split(" ").map(n => n[0]).join("").toUpperCase()
        : user?.email?.[0].toUpperCase() || "A"

    return (
        <aside className={cn(
            "h-screen bg-white border-r border-slate-200 transition-all duration-300 flex flex-col relative soft-shadow",
            collapsed ? "w-20" : "w-72"
        )}>
            <div className="p-6 flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                    <Bus className="text-white h-6 w-6" />
                </div>
                {!collapsed && (
                    <div className="flex flex-col">
                        <span className="font-black text-xl text-slate-900 tracking-tight">RideWay</span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                            <ShieldCheck className="h-2.5 w-2.5 text-blue-500" /> Admin Portal
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 h-6 w-6 bg-white border border-slate-200 rounded-full flex items-center justify-center soft-shadow hover:bg-slate-50 transition-colors z-50 text-slate-400"
            >
                {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </button>

            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all group",
                                isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                            )}
                        >
                            <item.icon className={cn(
                                "h-5 w-5 transition-colors",
                                isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"
                            )} />
                            {!collapsed && <span>{item.name}</span>}
                            {!collapsed && isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-50"></div>
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-slate-100 flex flex-col gap-4">
                <div className={cn(
                    "flex items-center gap-3 p-2 rounded-2xl bg-slate-50 border border-slate-100",
                    collapsed && "justify-center p-0 h-12 w-12 mx-auto overflow-hidden rounded-full"
                )}>
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 font-black text-sm border border-blue-200 overflow-hidden">
                        {user?.image ? (
                            <img src={user.image} alt="" className="h-full w-full object-cover" />
                        ) : initials}
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-black text-slate-900 truncate">{user?.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Administrator</span>
                        </div>
                    )}
                </div>

                <Button
                    variant="ghost"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className={cn(
                        "w-full flex items-center gap-3 justify-start rounded-xl font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all",
                        collapsed && "px-0 justify-center"
                    )}
                >
                    <LogOut className="h-5 w-5" />
                    {!collapsed && <span>Logout</span>}
                </Button>
            </div>
        </aside>
    )
}
