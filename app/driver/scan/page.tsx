"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Loader2, QrCode, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function ScanTicketPage() {
    const [ticketCode, setTicketCode] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const handleVerify = async () => {
        if (!ticketCode.trim()) return

        setLoading(true)
        setResult(null)

        try {
            const res = await fetch('/api/driver/verify-ticket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticketId: ticketCode.trim() })
            })
            const data = await res.json()
            setResult(data)
        } catch (error) {
            setResult({ valid: false, error: "Failed to verify ticket" })
        } finally {
            setLoading(false)
        }
    }

    const resetScan = () => {
        setTicketCode("")
        setResult(null)
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto max-w-lg space-y-6 p-6">
                <div className="flex items-center gap-4">
                    <Link href="/driver/dashboard">
                        <Button variant="outline" size="icon" className="rounded-xl">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Verify Ticket</h1>
                        <p className="text-sm font-medium text-slate-500">Enter the QR code value or ticket ID</p>
                    </div>
                </div>

                <Card className="rounded-3xl border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <QrCode className="h-5 w-5 text-blue-600" />
                            Ticket lookup
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Enter ticket ID or QR code value"
                            value={ticketCode}
                            onChange={(e) => setTicketCode(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                            className="h-14 rounded-2xl border-slate-300 text-center font-mono text-lg tracking-wider"
                            disabled={loading}
                        />
                        <Button
                            onClick={handleVerify}
                            disabled={loading || !ticketCode.trim()}
                            className="h-14 w-full rounded-2xl bg-blue-600 text-lg font-bold text-white hover:bg-blue-700"
                        >
                            {loading ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...</>
                            ) : (
                                <><CheckCircle2 className="mr-2 h-5 w-5" /> Verify Ticket</>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {result && (
                    <Card className={`rounded-3xl border-2 shadow-md ${result.valid ? "border-emerald-200 bg-emerald-50/50" : "border-rose-200 bg-rose-50/50"}`}>
                        <CardContent className="space-y-4 p-6 text-center">
                            {result.valid ? (
                                <>
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-emerald-700">Valid Ticket</h3>
                                        <p className="mt-1 font-medium text-emerald-600">Passenger checked in successfully</p>
                                    </div>
                                    {result.ticket && (
                                        <div className="space-y-2 rounded-2xl border border-emerald-100 bg-white p-4 text-left">
                                            <div className="flex justify-between gap-4">
                                                <span className="text-sm text-slate-500">Passenger</span>
                                                <span className="font-bold text-slate-900">{result.ticket.passengerName || result.ticket.passenger}</span>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <span className="text-sm text-slate-500">Seat</span>
                                                <span className="font-bold text-slate-900">{result.ticket.seatNumber}</span>
                                            </div>
                                            {result.ticket.route && (
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-sm text-slate-500">Route</span>
                                                    <span className="font-bold text-slate-900">{result.ticket.route}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
                                        <XCircle className="h-8 w-8 text-rose-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-rose-700">Invalid Ticket</h3>
                                        <p className="mt-1 font-medium text-rose-600">{result.error}</p>
                                    </div>
                                </>
                            )}
                            <Button
                                onClick={resetScan}
                                variant="outline"
                                className="mt-2 h-12 w-full rounded-2xl font-bold"
                            >
                                Verify Another Ticket
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
