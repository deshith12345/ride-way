"use client"

import React, { useMemo, useRef, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QRCodeCanvas } from "qrcode.react"
import { Calendar, Clock, Download, Hash, Loader2, ShieldCheck, Users } from "lucide-react"
import jsPDF from "jspdf"

interface TicketPassenger {
    id: string
    seatNumber: string
    passengerName: string
    passengerGender?: string
    qrCode?: string
}

interface TicketData {
    id: string
    bookingId?: string
    seatNumber?: string
    passengerName?: string
    passengerGender?: string
    qrCode?: string
    passengers?: TicketPassenger[]
    route: string
    departureDate: string
    departureTime: string
    origin: string
    destination: string
    busNumber: string
    busType: string
    totalAmount?: number
}

function encodeBase64Url(value: string) {
    const bytes = new TextEncoder().encode(value)
    let binary = ""

    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte)
    })

    const base64 = typeof window === "undefined"
        ? Buffer.from(value, "utf8").toString("base64")
        : window.btoa(binary)

    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

async function loadImageDataUrl(src: string) {
    const response = await fetch(src)
    const blob = await response.blob()

    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = reject
        reader.readAsDataURL(blob)
    })
}

export default function TicketDialog({ ticket }: { ticket: TicketData }) {
    const qrCanvasRef = useRef<HTMLCanvasElement>(null)
    const [downloading, setDownloading] = useState(false)
    const passengers = useMemo<TicketPassenger[]>(() => {
        if (ticket.passengers?.length) return ticket.passengers

        return [{
            id: ticket.id,
            seatNumber: ticket.seatNumber || "-",
            passengerName: ticket.passengerName || "Passenger",
            passengerGender: ticket.passengerGender,
            qrCode: ticket.qrCode,
        }]
    }, [ticket])

    const bookingId = ticket.bookingId || ticket.id
    const seatSummary = passengers.map((passenger) => passenger.seatNumber).join(", ")
    const passengerSummary = passengers.length === 1 ? passengers[0].passengerName : `${passengers.length} passengers`
    const verificationUrl = useMemo(() => {
        const payload = {
            b: bookingId,
            t: passengers.map((passenger) => ({
                i: passenger.id,
                q: passenger.qrCode || passenger.id,
            })),
        }
        const encodedPayload = encodeBase64Url(JSON.stringify(payload))
        const origin = typeof window === "undefined" ? "https://ride-way.vercel.app" : window.location.origin

        return `${origin}/ticket/verify?v=${encodedPayload}`
    }, [bookingId, passengers])

    const downloadTicket = async () => {
        if (!qrCanvasRef.current || downloading) return

        setDownloading(true)

        try {
            const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })
            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()
            const margin = 42
            const contentWidth = pageWidth - margin * 2
            const logoData = await loadImageDataUrl("/brand/rideway-logo.png").catch(() => null)
            const qrData = qrCanvasRef.current.toDataURL("image/png")

            pdf.setFillColor(248, 250, 252)
            pdf.rect(0, 0, pageWidth, pageHeight, "F")

            pdf.setFillColor(15, 23, 42)
            pdf.roundedRect(margin, 36, contentWidth, 100, 18, 18, "F")

            if (logoData) {
                pdf.setFillColor(255, 255, 255)
                pdf.roundedRect(60, 55, 54, 54, 12, 12, "F")
                pdf.addImage(logoData, "PNG", 64, 59, 46, 46)
            }

            pdf.setTextColor(255, 255, 255)
            pdf.setFont("helvetica", "bold")
            pdf.setFontSize(26)
            pdf.text("RideWay", logoData ? 128 : 64, 76)
            pdf.setFontSize(10)
            pdf.setTextColor(147, 197, 253)
            pdf.text("BOOKING E-TICKET", logoData ? 128 : 64, 98)

            pdf.setTextColor(203, 213, 225)
            pdf.setFontSize(9)
            pdf.text("BOOKING ID", pageWidth - 152, 70)
            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(13)
            pdf.text(bookingId.slice(-8).toUpperCase(), pageWidth - 152, 92)

            pdf.setFillColor(255, 255, 255)
            pdf.roundedRect(margin, 158, contentWidth, 128, 18, 18, "F")

            pdf.setTextColor(148, 163, 184)
            pdf.setFontSize(9)
            pdf.text("FROM", 68, 190)
            pdf.text("TO", pageWidth - 190, 190)

            pdf.setTextColor(15, 23, 42)
            pdf.setFont("helvetica", "bold")
            pdf.setFontSize(22)
            pdf.text(ticket.origin, 68, 220)
            pdf.text(ticket.destination, pageWidth - 190, 220)

            pdf.setDrawColor(191, 219, 254)
            pdf.setLineWidth(2)
            pdf.line(210, 210, pageWidth - 230, 210)
            pdf.setFillColor(37, 99, 235)
            pdf.circle(pageWidth / 2, 210, 4, "F")

            pdf.setFontSize(10)
            pdf.setTextColor(71, 85, 105)
            pdf.text(`Date: ${ticket.departureDate}`, 68, 258)
            pdf.text(`Boarding: ${ticket.departureTime}`, 230, 258)
            pdf.text(`Bus: ${ticket.busNumber}`, 390, 258)

            const passengerBoxHeight = Math.max(120, 58 + passengers.length * 34)
            pdf.setFillColor(255, 255, 255)
            pdf.roundedRect(margin, 306, contentWidth, passengerBoxHeight, 18, 18, "F")
            pdf.setTextColor(15, 23, 42)
            pdf.setFontSize(15)
            pdf.text("Passenger Seats", 68, 338)

            let y = 366
            passengers.forEach((passenger) => {
                pdf.setFillColor(248, 250, 252)
                pdf.roundedRect(68, y - 16, contentWidth - 52, 28, 8, 8, "F")
                pdf.setTextColor(15, 23, 42)
                pdf.setFontSize(11)
                pdf.text(passenger.passengerName, 84, y + 2)
                pdf.setTextColor(37, 99, 235)
                pdf.text(`Seat ${passenger.seatNumber}`, pageWidth - 148, y + 2)
                y += 34
            })

            let qrBoxY = 306 + passengerBoxHeight + 28
            if (qrBoxY + 250 > pageHeight - margin) {
                pdf.addPage()
                pdf.setFillColor(248, 250, 252)
                pdf.rect(0, 0, pageWidth, pageHeight, "F")
                qrBoxY = 60
            }

            pdf.setFillColor(255, 255, 255)
            pdf.roundedRect(margin, qrBoxY, contentWidth, 250, 18, 18, "F")
            pdf.addImage(qrData, "PNG", pageWidth / 2 - 92, qrBoxY + 28, 184, 184)

            pdf.setTextColor(15, 23, 42)
            pdf.setFontSize(12)
            pdf.text("Scan to open the RideWay verification page", pageWidth / 2, qrBoxY + 231, { align: "center" })
            pdf.setTextColor(22, 163, 74)
            pdf.setFontSize(10)
            pdf.text("QR valid until this trip ends", pageWidth / 2, qrBoxY + 250, { align: "center" })

            pdf.save(`RideWay-Booking-${bookingId}.pdf`)
        } finally {
            setDownloading(false)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-slate-200 font-bold transition-all hover:border-blue-200 hover:bg-white hover:text-blue-600">
                    <Download className="h-4 w-4" /> View & Download
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[92vh] max-w-[min(94vw,500px)] overflow-y-auto rounded-[28px] border-none bg-slate-50 p-0 shadow-2xl">
                <DialogHeader className="border-b border-slate-100 bg-white p-5">
                    <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
                        <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-blue-100">
                            <img src="/brand/rideway-logo.png" alt="RideWay" className="h-full w-full object-contain" />
                        </span>
                        Booking E-Ticket
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 p-4 sm:p-5">
                    <div className="mx-auto flex w-full max-w-[420px] flex-col overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50">
                        <div className="flex items-center justify-between bg-slate-900 p-5 text-white">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-950/20">
                                    <img src="/brand/rideway-logo.png" alt="RideWay" className="h-full w-full object-contain" />
                                </div>
                                <div>
                                    <span className="block text-xl font-black tracking-tight">RideWay</span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-200">Verified Booking Pass</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Booking ID</p>
                                <p className="text-sm font-bold text-blue-300">{bookingId.slice(-8).toUpperCase()}</p>
                            </div>
                        </div>

                        <div className="space-y-6 border-b border-slate-100 p-5">
                            <div className="flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">From</p>
                                    <p className="truncate text-xl font-black leading-none text-slate-900">{ticket.origin}</p>
                                </div>
                                <div className="flex flex-1 items-center">
                                    <div className="relative h-px w-full bg-slate-100">
                                        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600" />
                                    </div>
                                </div>
                                <div className="min-w-0 text-right">
                                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">To</p>
                                    <p className="truncate text-xl font-black leading-none text-slate-900">{ticket.destination}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-2.5 text-slate-400">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Departure</p>
                                        <p className="text-sm font-black text-slate-900">{ticket.departureDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-2.5 text-slate-400">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Boarding</p>
                                        <p className="text-sm font-black text-slate-900">{ticket.departureTime}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 bg-slate-50/70 p-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl border border-slate-100 bg-white p-2.5 text-slate-400 shadow-lg shadow-slate-200/50">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Passengers</p>
                                        <p className="truncate text-sm font-black uppercase text-slate-900">{passengerSummary}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl border border-slate-100 bg-white p-2.5 text-slate-400 shadow-lg shadow-slate-200/50">
                                        <Hash className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Seats</p>
                                        <p className="truncate text-sm font-black text-blue-600">{seatSummary}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-3">
                                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Passenger List</p>
                                <div className="space-y-2">
                                    {passengers.map((passenger) => (
                                        <div key={passenger.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold">
                                            <span className="truncate text-slate-900">{passenger.passengerName}</span>
                                            <span className="shrink-0 rounded-lg bg-blue-600 px-2 py-1 text-white">Seat {passenger.seatNumber}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-3">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Bus</p>
                                    <p className="text-sm font-black text-slate-900">{ticket.busNumber}</p>
                                </div>
                                <span className="rounded-xl bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">{ticket.busType}</span>
                            </div>
                        </div>

                        <div className="relative flex flex-col items-center justify-center gap-4 border-t border-dashed border-slate-200 bg-white p-6">
                            <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-slate-50" />
                            <div className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-slate-50" />

                            <div className="rounded-[32px] border-4 border-slate-50 bg-white p-4 shadow-2xl">
                                <QRCodeCanvas
                                    ref={qrCanvasRef}
                                    value={verificationUrl}
                                    size={174}
                                    level="H"
                                    includeMargin={false}
                                    imageSettings={{
                                        src: "/brand/rideway-logo.png",
                                        height: 34,
                                        width: 34,
                                        excavate: true,
                                    }}
                                />
                            </div>
                            <div className="space-y-2 text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Scan To Verify</p>
                                <p className="text-xs font-black text-green-600">OPENS RIDEWAY AUTHENTICITY PAGE</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={downloadTicket}
                        disabled={downloading}
                        className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 text-lg font-bold text-white shadow-xl shadow-slate-200 transition-all hover:bg-black"
                    >
                        {downloading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" /> Preparing PDF
                            </>
                        ) : (
                            <>
                                <Download className="h-5 w-5" /> Download PDF Ticket
                            </>
                        )}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-center text-[10px] font-bold uppercase leading-relaxed tracking-wider text-slate-400">
                        <ShieldCheck className="h-4 w-4 text-blue-600" />
                        One booking pass covers all passengers and expires after the trip ends.
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
