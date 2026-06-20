"use client"

import React, { useMemo, useRef } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { Download, Bus, Calendar, Clock, Hash, Users } from "lucide-react"
import html2canvas from "html2canvas"
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
}

export default function TicketDialog({ ticket }: { ticket: TicketData }) {
    const ticketRef = useRef<HTMLDivElement>(null)
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
    const qrValue = JSON.stringify({
        type: "RIDEWAY_BOOKING_TICKET",
        bookingId,
        tickets: passengers.map((passenger) => ({
            ticketId: passenger.id,
            qrCode: passenger.qrCode || passenger.id,
        })),
    })

    const downloadTicket = async () => {
        if (!ticketRef.current) return

        const canvas = await html2canvas(ticketRef.current, {
            scale: 2,
            backgroundColor: "#f8fafc",
            logging: false,
            useCORS: true,
        })

        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "px",
            format: [canvas.width / 2, canvas.height / 2],
        })

        pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2)
        pdf.save(`RideWay-Booking-${bookingId}.pdf`)
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
                        <span className="rounded-xl bg-blue-50 p-2 text-blue-600">
                            <Bus className="h-6 w-6" />
                        </span>
                        Booking E-Ticket
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 p-4 sm:p-5">
                    <div ref={ticketRef} className="mx-auto flex w-full max-w-[420px] flex-col overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50">
                        <div className="flex items-center justify-between bg-slate-900 p-5 text-white">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-blue-600 p-2 shadow-lg shadow-blue-500/20">
                                    <Bus className="h-5 w-5" />
                                </div>
                                <span className="text-xl font-black tracking-tight">RideWay</span>
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
                                <QRCodeSVG value={qrValue} size={174} level="H" includeMargin={false} />
                            </div>
                            <div className="space-y-2 text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Booking Pass QR</p>
                                <p className="text-xs font-black text-green-500">VALID UNTIL TRIP ENDS</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={downloadTicket}
                        className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 text-lg font-bold text-white shadow-xl shadow-slate-200 transition-all hover:bg-black"
                    >
                        <Download className="h-5 w-5" /> Download PDF Ticket
                    </Button>

                    <p className="text-center text-[10px] font-bold uppercase leading-relaxed tracking-wider text-slate-400">
                        Present this one booking pass during boarding. The QR expires after the trip ends.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
