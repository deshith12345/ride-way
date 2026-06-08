
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { QrCode, CheckCircle2, XCircle, Loader2, ArrowLeft, Camera, Keyboard } from "lucide-react"
import Link from "next/link"

export default function ScanTicketPage() {
    const [mode, setMode] = useState<"camera" | "manual">("manual")
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
            <div className="container max-w-lg mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/driver/dashboard">
                        <Button variant="outline" size="icon" className="rounded-xl">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Scan Ticket</h1>
                        <p className="text-slate-500 text-sm font-medium">Verify passenger tickets</p>
                    </div>
                </div>

                {/* Mode Toggle */}
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                    <Button
                        variant={mode === "camera" ? "default" : "ghost"}
                        className={`flex-1 rounded-lg gap-2 ${mode === "camera" ? "bg-white shadow-sm" : ""}`}
                        onClick={() => setMode("camera")}
                    >
                        <Camera className="h-4 w-4" /> Camera
                    </Button>
                    <Button
                        variant={mode === "manual" ? "default" : "ghost"}
                        className={`flex-1 rounded-lg gap-2 ${mode === "manual" ? "bg-white shadow-sm" : ""}`}
                        onClick={() => setMode("manual")}
                    >
                        <Keyboard className="h-4 w-4" /> Manual Entry
                    </Button>
                </div>

                {mode === "camera" ? (
                    /* Camera Scanner Placeholder */
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardContent className="p-0">
                            <div className="aspect-square bg-slate-900 relative flex items-center justify-center">
                                <div className="absolute inset-8 border-2 border-white/30 rounded-3xl" />
                                <div className="absolute inset-8 flex items-center justify-center">
                                    <div className="w-48 h-48 border-2 border-blue-400 rounded-2xl animate-pulse" />
                                </div>
                                <div className="absolute bottom-6 left-0 right-0 text-center">
                                    <p className="text-white/70 text-sm font-medium">Point camera at QR code</p>
                                    <p className="text-white/40 text-xs mt-1">Camera integration coming soon — use Manual Entry</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    /* Manual Entry */
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <QrCode className="h-5 w-5 text-blue-600" />
                                Enter Ticket ID
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                placeholder="Enter ticket ID or scan code..."
                                value={ticketCode}
                                onChange={(e) => setTicketCode(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                                className="h-14 text-lg font-mono text-center tracking-wider border-slate-300"
                                disabled={loading}
                            />
                            <Button
                                onClick={handleVerify}
                                disabled={loading || !ticketCode.trim()}
                                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-lg font-bold"
                            >
                                {loading ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...</>
                                ) : (
                                    <><CheckCircle2 className="mr-2 h-5 w-5" /> Verify Ticket</>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Result */}
                {result && (
                    <Card className={`border-2 shadow-md ${result.valid ? "border-emerald-200 bg-emerald-50/50" : "border-rose-200 bg-rose-50/50"}`}>
                        <CardContent className="p-6 text-center space-y-4">
                            {result.valid ? (
                                <>
                                    <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-emerald-700">Valid Ticket</h3>
                                        <p className="text-emerald-600 font-medium mt-1">Passenger checked in successfully</p>
                                    </div>
                                    {result.ticket && (
                                        <div className="bg-white rounded-xl p-4 space-y-2 text-left border border-emerald-100">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-slate-500">Passenger</span>
                                                <span className="font-bold text-slate-900">{result.ticket.passengerName || result.ticket.passenger}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-slate-500">Seat</span>
                                                <span className="font-bold text-slate-900">{result.ticket.seatNumber}</span>
                                            </div>
                                            {result.ticket.route && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-slate-500">Route</span>
                                                    <span className="font-bold text-slate-900">{result.ticket.route}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
                                        <XCircle className="h-8 w-8 text-rose-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-rose-700">Invalid Ticket</h3>
                                        <p className="text-rose-600 font-medium mt-1">{result.error}</p>
                                    </div>
                                </>
                            )}
                            <Button
                                onClick={resetScan}
                                variant="outline"
                                className="w-full h-12 rounded-xl font-bold mt-2"
                            >
                                Scan Another Ticket
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
