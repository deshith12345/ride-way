
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import UserMenu from "./UserMenu"
import BrandLogo from "./BrandLogo"
import { useSession } from "next-auth/react"

export default function Header() {
    const { data: session } = useSession()

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 transition-all duration-300 shadow-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <BrandLogo href="/" size="sm" />

                <nav className="hidden md:flex gap-8 items-center">
                    <Link href="/" className="text-sm font-medium transition-colors text-slate-700 hover:text-blue-600 hover:scale-105 transform">
                        Home
                    </Link>
                    <Link href="/routes" className="text-sm font-medium transition-colors text-slate-700 hover:text-blue-600 hover:scale-105 transform">
                        Routes
                    </Link>
                    <Link href="/track" className="text-sm font-medium transition-colors text-slate-700 hover:text-blue-600 hover:scale-105 transform">
                        Track Bus
                    </Link>
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
