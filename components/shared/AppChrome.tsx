"use client"

import { usePathname } from "next/navigation"
import Header from "./Header"
import Footer from "./Footer"

export default function AppChrome({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const hidePublicChrome =
        pathname.startsWith("/admin") ||
        pathname.startsWith("/driver") ||
        pathname === "/login" ||
        pathname === "/register"

    return (
        <>
            {!hidePublicChrome && <Header />}
            <div className="flex-grow">
                {children}
            </div>
            {!hidePublicChrome && <Footer />}
        </>
    )
}
