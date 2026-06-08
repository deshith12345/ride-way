
"use client"

import React, { useRef } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { Download, Bus, Calendar, Clock, MapPin, User, Hash } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"


interface TicketData {
    id: string
    seatNumber: string
    passengerName: string
    passengerGender?: string
    qrCode?: string
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

    const downloadTicket = async () => {
        if (!ticketRef.current) return

        const canvas = await html2canvas(ticketRef.current, {
            scale: 2,
            backgroundColor: "#f8fafc",
            logging: false,
            useCORS: true
        })

        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "px",
            format: [canvas.width / 2, canvas.height / 2]
        })

        pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2)
        pdf.save(`Ticket-${ticket.seatNumber}-${ticket.id}.pdf`)
    }

    const qrValue = ticket.qrCode || JSON.stringify({
        id: ticket.id,
        seat: ticket.seatNumber,
        name: ticket.passengerName,
        trip: ticket.route
    })

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full h-12 rounded-2xl border-slate-200 hover:bg-white hover:text-blue-600 hover:border-blue-200 font-bold transition-all flex items-center justify-center gap-2 group">
                    <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" /> View & Download
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md p-0 overflow-hidden bg-slate-50 border-none rounded-[32px] sm:rounded-[40px] shadow-2xl">
                <DialogHeader className="p-8 bg-white border-b border-slate-50">
                    <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <Bus className="h-6 w-6" />
                        </div>
                        E-Ticket Details
                    </DialogTitle>
                </DialogHeader>

                <div className="p-8 space-y-8">
                    {/* Ticket to be screenshotted */}
                    <div ref={ticketRef} className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-50 flex flex-col">
                        {/* Header */}
                        <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                                    <Bus className="h-6 w-6" />
                                </div>
                                <span className="text-2xl font-black tracking-tight">RideWay</span>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Ticket ID</p>
                                <p className="text-sm font-bold text-blue-400">{ticket.id.slice(-8).toUpperCase()}</p>
                            </div>
                        </div>

                        {/* Route Info */}
                        <div className="p-8 border-b border-slate-50 space-y-8">
                            <div className="flex justify-between items-center">
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">From</p>
                                    <p className="text-2xl font-black text-slate-900 leading-none">{ticket.origin}</p>
                                </div>
                                <div className="flex-1 flex flex-col items-center px-4">
                                    <div className="w-full h-px bg-slate-100 relative">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">To</p>
                                    <p className="text-2xl font-black text-slate-900 leading-none">{ticket.destination}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl border border-slate-100">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Departure Date</p>
                                        <p className="text-sm font-black text-slate-900">{ticket.departureDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl border border-slate-100">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Boarding Time</p>
                                        <p className="text-sm font-black text-slate-900">{ticket.departureTime}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Passenger & Seat */}
                        <div className="p-8 bg-slate-50/50 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white shadow-xl shadow-slate-200/50 text-slate-400 rounded-2xl border border-slate-100">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Passenger Name</p>
                                        <p className="text-lg font-black text-slate-900 truncate uppercase tracking-tighter">{ticket.passengerName}</p>
                                    </div>
                                </div>
                                <div className="px-4 py-2 bg-white rounded-2xl shadow-sm border border-slate-200 text-[10px] font-black text-blue-600">
                                    {ticket.passengerGender?.toUpperCase() || 'MALE'}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white shadow-xl shadow-slate-200/50 text-slate-400 rounded-2xl border border-slate-100">
                                        <Hash className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Seat No</p>
                                        <p className="text-2xl font-black text-blue-600">{ticket.seatNumber}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white shadow-xl shadow-slate-200/50 text-slate-400 rounded-2xl border border-slate-100">
                                        <Bus className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Bus</p>
                                        <p className="text-sm font-black text-slate-900">{ticket.busNumber}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* QR Code Section */}
                        <div className="p-10 flex flex-col items-center justify-center gap-6 bg-white border-t border-dashed border-slate-200 relative">
                            {/* Stub effect */}
                            <div className="absolute -top-3 -left-3 w-6 h-6 bg-slate-50 rounded-full" />
                            <div className="absolute -top-3 -right-3 w-6 h-6 bg-slate-50 rounded-full" />

                            <div className="p-6 bg-white border-4 border-slate-50 rounded-[40px] shadow-2xl scale-110">
                                <QRCodeSVG
                                    value={qrValue}
                                    size={180}
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Boarding Pass QR</p>
                                <p className="text-xs font-black text-green-500 animate-pulse">VERIFIED E-TICKET</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={downloadTicket}
                        className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl text-lg font-bold flex items-center justify-center gap-3 shadow-xl shadow-slate-200 transition-all"
                    >
                        <Download className="h-5 w-5" /> Download PDF Ticket
                    </Button>

                    <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
                        Please present this digital ticket or a printed copy during boarding.
                        Carry a valid photo ID for verification.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
