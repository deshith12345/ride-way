
"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Suspense } from "react"

function CheckoutRedirect() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const tripId = searchParams.get("tripId")

    useEffect(() => {
        if (!tripId) {
            router.replace("/search")
        }
        // The actual checkout is handled by POST /api/checkout → Stripe hosted checkout
        // This page exists only as a fallback redirect
    }, [tripId, router])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-600 font-medium">Redirecting to payment...</p>
            <p className="text-slate-400 text-sm mt-2">If you are not redirected, please go back and try again.</p>
        </div>
    )
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        }>
            <CheckoutRedirect />
        </Suspense>
    )
}
