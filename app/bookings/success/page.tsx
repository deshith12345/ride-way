
"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Ticket, ArrowRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function SuccessContent() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get("session_id")

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <CheckCircle2 className="w-12 h-12" />
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-2">Booking Confirmed!</h1>
                <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                    Thank you for choosing RideWay. Your payment was successful and your seats are now reserved.
                </p>

                <div className="space-y-4">
                    <Link href="/dashboard" className="block">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-2xl text-lg font-bold shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2">
                            View My Tickets <Ticket className="w-5 h-5" />
                        </Button>
                    </Link>

                    <div className="flex gap-4">
                        <Link href="/" className="flex-1">
                            <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 text-slate-600 font-bold flex items-center justify-center gap-2">
                                <Home className="w-4 h-4" /> Home
                            </Button>
                        </Link>
                        <Link href="/dashboard" className="flex-1">
                            <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 text-slate-600 font-bold flex items-center justify-center gap-2">
                                Dashboard <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                <p className="mt-10 text-[10px] text-slate-400 font-black uppercase tracking-widest leading-relaxed">
                    A confirmation email has been sent to your registered address with the booking details.
                </p>
            </div>
        </div>
    )
}

export default function BookingSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    )
}
