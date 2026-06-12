"use client"

import React, { useMemo, useState } from 'react'
import { cn } from "@/lib/utils"
import { Armchair, CircleDot } from "lucide-react"

interface Seat {
    id: string
    number: string
    status: 'available' | 'occupied' | 'selected' | 'reserved'
    gender?: 'male' | 'female'
    price: number
}

interface SeatMapProps {
    totalSeats?: number
    onSeatSelect: (selectedSeats: Seat[]) => void
}

const generateSeats = (count: number): Seat[] => {
    const seats: Seat[] = []
    for (let i = 0; i < count; i++) {
        const seed = (i + 1) * 17 + count * 13
        const isOccupied = seed % 10 < 3
        const isReserved = !isOccupied && seed % 23 === 0
        const gender = isOccupied ? (seed % 2 === 0 ? 'male' : 'female') : undefined

        seats.push({
            id: `seat-${count}-${i}`,
            number: (i + 1).toString(),
            status: isOccupied ? 'occupied' : (isReserved ? 'reserved' : 'available'),
            gender: gender,
            price: 1500
        })
    }
    return seats
}

export default function SeatMap({ totalSeats = 45, onSeatSelect }: SeatMapProps) {
    const baseSeats = useMemo(() => generateSeats(totalSeats), [totalSeats])
    const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([])
    const activeSelectedIds = selectedSeatIds.filter(id => baseSeats.some(seat => seat.id === id))
    const seats = baseSeats.map(seat => (
        activeSelectedIds.includes(seat.id) ? { ...seat, status: 'selected' as const } : seat
    ))

    const handleSeatClick = (seat: Seat) => {
        if (seat.status === 'occupied' || seat.status === 'reserved') return

        const isSelected = activeSelectedIds.includes(seat.id)
        let newSelectedIds: string[]

        if (isSelected) {
            newSelectedIds = activeSelectedIds.filter(id => id !== seat.id)
        } else {
            if (activeSelectedIds.length >= 5) {
                alert("You can only select up to 5 seats.")
                return
            }
            newSelectedIds = [...activeSelectedIds, seat.id]
        }

        const newSelected = baseSeats
            .filter(s => newSelectedIds.includes(s.id))
            .map(s => ({ ...s, status: 'selected' as const }))

        setSelectedSeatIds(newSelectedIds)
        onSeatSelect(newSelected)
    }

    // Calculating rows for 2-3 layout (5 seats per row)
    const rows = Math.ceil(totalSeats / 5)

    return (
        <div className="flex flex-col items-center">
            {/* Compact Premium Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-10 px-8 py-3 bg-white/70 backdrop-blur-xl rounded-[24px] border border-slate-200/50 shadow-xl shadow-slate-200/20">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-[6px] bg-white border-2 border-slate-200 shadow-sm"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-[6px] bg-gradient-to-br from-blue-500 to-indigo-600 border border-blue-400/50 shadow-md shadow-blue-200"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-[6px] bg-gradient-to-br from-slate-200 to-slate-300 border border-slate-200 flex items-center justify-center">
                        <span className="text-[8px] font-black text-slate-600">M</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Male</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-[6px] bg-gradient-to-br from-rose-100 to-rose-200 border border-rose-100 flex items-center justify-center">
                        <span className="text-[8px] font-black text-rose-500">F</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Female</span>
                </div>
            </div>

            {/* Compact Realistic Bus Shell */}
            <div className="relative max-w-fit px-6 py-10 bg-slate-100/40 rounded-[56px] border-[8px] border-slate-900 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] overflow-hidden">
                {/* Windows Decor - Tightened */}
                <div className="absolute top-0 inset-x-0 bottom-0 pointer-events-none flex justify-between px-1.5 py-24">
                    <div className="w-1.5 h-full flex flex-col gap-6 opacity-15">
                        {Array.from({ length: 10 }).map((_, i) => <div key={i} className="flex-1 bg-white rounded-full" />)}
                    </div>
                    <div className="w-1.5 h-full flex flex-col gap-6 opacity-15">
                        {Array.from({ length: 10 }).map((_, i) => <div key={i} className="flex-1 bg-white rounded-full" />)}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-inner relative z-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/50 pointer-events-none rounded-[40px]" />

                    {/* Compact Front Cabin with Driver Seat */}
                    <div className="flex justify-start mb-10 px-2 relative">
                        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-24 h-px bg-slate-50" />
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-slate-800 to-slate-900 border-b-[4px] border-slate-950 flex items-center justify-center shadow-lg relative overflow-hidden group">
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute top-1 w-1/2 h-1 bg-white/10 rounded-full blur-[0.4px]" />
                                <CircleDot className="h-6 w-6 text-slate-400 rotate-45" />
                            </div>
                            <span className="mt-2 text-[8px] font-black uppercase text-slate-400 tracking-[0.2em]">Driver</span>
                        </div>
                    </div>

                    {/* Compact 2-3 Seat Map Grid */}
                    <div className="grid grid-cols-6 gap-3 relative">
                        {Array.from({ length: rows }).map((_, rowIndex) => {
                            const startIndex = rowIndex * 5
                            return (
                                <React.Fragment key={rowIndex}>
                                    {renderSeat(seats[startIndex], handleSeatClick)}
                                    {renderSeat(seats[startIndex + 1], handleSeatClick)}

                                    <div className="w-full flex items-center justify-center min-w-[12px]">
                                        <div className="w-1 h-full bg-slate-50/60 rounded-full shadow-inner" />
                                    </div>

                                    {renderSeat(seats[startIndex + 2], handleSeatClick)}
                                    {renderSeat(seats[startIndex + 3], handleSeatClick)}
                                    {renderSeat(seats[startIndex + 4], handleSeatClick)}
                                </React.Fragment>
                            )
                        })}
                    </div>

                    {/* Compact Rear Indicator */}
                    <div className="mt-12 flex justify-center">
                        <div className="px-8 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] shadow-inner-sm">
                            Tail
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function renderSeat(seat: Seat | undefined, onClick: (s: Seat) => void) {
    if (!seat) return <div className="w-12 h-12 invisible"></div>

    const getStatusStyles = (s: Seat) => {
        if (s.status === 'selected')
            return "bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-400/50 shadow-[0_6px_12px_-4px_rgba(59,130,246,0.4)] translate-y-[-3px]"
        if (s.status === 'occupied') {
            return s.gender === 'female'
                ? "bg-gradient-to-br from-rose-50 to-rose-100 text-rose-500 border-rose-200/40 opacity-90 cursor-not-allowed"
                : "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 border-slate-300/40 opacity-90 cursor-not-allowed"
        }
        if (s.status === 'reserved')
            return "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-50"

        return "bg-white border-slate-200/80 text-slate-900 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.04)] hover:border-blue-400 hover:translate-y-[-3px] hover:shadow-[0_12px_20px_-8px_rgba(0,0,0,0.1)] transition-all duration-300 active:translate-y-0 active:shadow-sm"
    }

    return (
        <button
            onClick={() => onClick(seat)}
            disabled={seat.status === 'occupied' || seat.status === 'reserved'}
            className={cn(
                "w-12 h-12 rounded-[14px] border-[1.5px] flex flex-col items-center justify-center relative transition-all group overflow-hidden",
                getStatusStyles(seat)
            )}
        >
            <div className={cn(
                "absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity",
                seat.status === 'selected' ? "opacity-100" : ""
            )} />

            <div className={cn(
                "absolute top-1 w-1/2 h-1 rounded-full blur-[0.4px]",
                seat.status === 'selected' ? "bg-white/40" : "bg-slate-100"
            )} />

            <div className="z-10 flex flex-col items-center justify-center h-full">
                {seat.status === 'selected' ? (
                    <Armchair className="h-5 w-5 text-white animate-in zoom-in slide-in-from-bottom duration-500 fill-white/10" />
                ) : seat.status === 'occupied' ? (
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] font-black uppercase tracking-tight opacity-40 leading-none mb-0.5">
                            {seat.number}
                        </span>
                        <span className="text-xs font-black uppercase leading-none">
                            {seat.gender === 'male' ? 'M' : 'F'}
                        </span>
                    </div>
                ) : (
                    <span className="text-sm font-black tracking-tighter text-slate-800 transition-all group-hover:scale-105 group-hover:text-blue-600">
                        {seat.number}
                    </span>
                )}
            </div>

            <div className="absolute inset-x-0 bottom-0 h-1 bg-black/[0.03] blur-[1px]" />
        </button>
    )
}
