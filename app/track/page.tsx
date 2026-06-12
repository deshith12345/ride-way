"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Bus, Info, Search, ShieldCheck } from "lucide-react"

export default function TrackBusPage() {
    const [busNo, setBusNo] = useState("")
    const [searched, setSearched] = useState(false)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!busNo.trim()) return
        setSearched(true)
    }

    return (
        <div className="min-h-screen bg-[#f6f8fb] pb-20 pt-12">
            <div className="container mx-auto max-w-5xl px-4">
                <div className="mx-auto mb-10 max-w-2xl text-center">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-blue-50 text-blue-700 shadow-sm">
                        <Bus className="h-7 w-7" />
                    </div>
                    <h1 className="text-4xl font-black tracking-normal text-slate-950">Track Bus</h1>
                    <p className="mx-auto mt-3 max-w-xl font-medium leading-7 text-slate-600">
                        Enter a bus number or ticket reference to check tracking availability.
                    </p>
                </div>

                <Card className="mx-auto max-w-2xl rounded-[2rem] border-white bg-white/80 shadow-xl shadow-slate-200/70 backdrop-blur-xl">
                    <CardContent className="p-4 sm:p-5">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={busNo}
                                onChange={(e) => {
                                    setBusNo(e.target.value)
                                    setSearched(false)
                                }}
                                placeholder="Enter bus number or ticket reference"
                                className="h-14 rounded-[1.4rem] border-slate-200 bg-white pl-12 pr-32 text-base font-bold shadow-sm"
                            />
                            <Button
                                type="submit"
                                className="absolute right-1.5 top-1.5 h-11 rounded-[1.1rem] bg-blue-600 px-5 font-black text-white hover:bg-blue-700"
                            >
                                Check
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {searched ? (
                    <div className="mx-auto mt-8 max-w-2xl rounded-[2rem] border border-amber-100 bg-amber-50/80 p-6 shadow-lg shadow-amber-100/40">
                        <div className="flex gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-white text-amber-700 shadow-sm">
                                <Info className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-black text-slate-950">Live tracking is not available for this reference yet</h2>
                                <p className="mt-2 font-medium leading-7 text-slate-600">
                                    RideWay is ready for verified ticket and route data, but live GPS tracking must be connected to a real fleet tracking provider before locations can be shown.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mx-auto mt-8 max-w-2xl rounded-[2rem] border border-white bg-white/70 p-6 shadow-lg shadow-slate-200/50 backdrop-blur-xl">
                        <div className="flex gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-emerald-50 text-emerald-700">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-black text-slate-950">Tracking source required</h2>
                                <p className="mt-2 font-medium leading-7 text-slate-600">
                                    This page shows live locations only after a real fleet tracking source is connected.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
