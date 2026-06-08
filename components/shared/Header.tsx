
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { auth } from "@/auth"
import UserMenu from "./UserMenu"

export default async function Header() {
    const session = await auth()

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 transition-all duration-300 shadow-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center space-x-2 group">
                    <span className="text-2xl font-bold gradient-text group-hover:scale-105 transition-transform">
                        RideWay
                    </span>
                    {session?.user?.role && (
                        <span className="text-[10px] font-black uppercase tracking-tighter bg-blue-600 text-white px-1.5 py-0.5 rounded ml-1 animate-pulse shadow-sm">
                            {session.user.role}
                        </span>
                    )}
                </Link>

                <nav className="hidden md:flex gap-8 items-center">
                    <Link href="/" className="text-sm font-medium transition-colors text-slate-700 hover:text-blue-600 hover:scale-105 transform">
                        Home
                    </Link>
                    {session?.user?.role === "ADMIN" ? (
                        <>
                            <Link href="/admin/dashboard" className="text-sm font-medium transition-colors text-slate-700 hover:text-blue-600 hover:scale-105 transform">
                                Fleet
                            </Link>
                            <Link href="/admin/schedules" className="text-sm font-medium transition-colors text-slate-700 hover:text-blue-600 hover:scale-105 transform">
                                Schedules
                            </Link>
                            <Link href="/admin/routes" className="text-sm font-medium transition-colors text-slate-700 hover:text-blue-600 hover:scale-105 transform">
                                Routes
                            </Link>
                        </>
                    ) : session?.user?.role === "DRIVER" ? (
                        <>
                            <Link href="/driver/dashboard" className="text-sm font-medium transition-colors text-slate-700 hover:text-blue-600 hover:scale-105 transform">
                                My Trips
                            </Link>
                            <Link href="/driver/scan" className="text-sm font-medium transition-colors text-slate-700 hover:text-blue-600 hover:scale-105 transform">
                                Scan Tickets
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/routes" className="text-sm font-medium transition-colors text-slate-700 hover:text-blue-600 hover:scale-105 transform">
                                Routes
                            </Link>
                            <Link href="/track" className="text-sm font-medium transition-colors text-slate-700 hover:text-blue-600 hover:scale-105 transform">
                                Track Bus
                            </Link>
                        </>
                    )}
                    <Link href="/help" className="text-sm font-medium transition-colors text-slate-700 hover:text-blue-600 hover:scale-105 transform">
                        Help
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    {session?.user ? (
                        <UserMenu user={session.user} />
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" className="text-slate-700 hover:text-blue-600 hover:bg-blue-50">
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="gradient-primary text-white rounded-full px-6 shadow-md hover:shadow-lg transition-all hover:scale-105">
                                    Sign up
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
