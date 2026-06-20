import Link from "next/link"
import { format } from "date-fns"
import { AlertTriangle, Bus, Calendar, CheckCircle2, Clock, Hash, ShieldCheck, Ticket, Users, XCircle } from "lucide-react"
import BrandLogo from "@/components/shared/BrandLogo"
import { Button } from "@/components/ui/button"
import {
    ticketVerificationInputFromSearchParams,
    verifyTicketAuthenticity,
    type TicketVerificationResult,
} from "@/lib/ticket-verification"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

type VerifyPageProps = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

function fallbackResult(): TicketVerificationResult {
    return {
        valid: false,
        authentic: false,
        httpStatus: 400,
        error: "Fake or malformed RideWay QR",
    }
}

function statusTone(result: TicketVerificationResult) {
    if (result.valid) {
        return {
            title: "Authentic Ticket",
            message: result.message || "This RideWay ticket is valid for boarding.",
            Icon: CheckCircle2,
            shell: "border-emerald-200 bg-emerald-50 text-emerald-700",
            icon: "bg-emerald-100 text-emerald-700",
            badge: "bg-emerald-600 text-white",
            accent: "text-emerald-700",
        }
    }

    if (result.authentic) {
        const title = result.expired
            ? "Authentic But Expired"
            : result.alreadyUsed
                ? "Authentic But Already Used"
                : "Authentic But Not Usable"

        return {
            title,
            message: result.error || "This ticket belongs to RideWay, but it cannot be used for boarding.",
            Icon: AlertTriangle,
            shell: "border-amber-200 bg-amber-50 text-amber-800",
            icon: "bg-amber-100 text-amber-700",
            badge: "bg-amber-600 text-white",
            accent: "text-amber-700",
        }
    }

    return {
        title: "Fake / Not Found",
        message: result.error || "This QR code does not match a valid RideWay ticket.",
        Icon: XCircle,
        shell: "border-rose-200 bg-rose-50 text-rose-700",
        icon: "bg-rose-100 text-rose-700",
        badge: "bg-rose-600 text-white",
        accent: "text-rose-700",
    }
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                <p className="truncate text-sm font-black text-slate-900">{value || "--"}</p>
            </div>
        </div>
    )
}

export default async function TicketVerifyPage({ searchParams }: VerifyPageProps) {
    const params = await searchParams
    const input = ticketVerificationInputFromSearchParams(params)
    const verification = input ? await verifyTicketAuthenticity(input) : fallbackResult()
    const tone = statusTone(verification)
    const StatusIcon = tone.Icon
    const departureTime = verification.booking?.departureTime
        ? new Date(verification.booking.departureTime)
        : null
    const arrivalTime = verification.booking?.arrivalTime
        ? new Date(verification.booking.arrivalTime)
        : null

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-10">
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <BrandLogo href="/" size="md" subtitle="Ticket Verification" />
                    <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 sm:block">
                        Live Check
                    </div>
                </div>

                <section className={cn("overflow-hidden rounded-[28px] border-2 shadow-xl shadow-slate-200/70", tone.shell)}>
                    <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
                        <div className={cn("flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl", tone.icon)}>
                            <StatusIcon className="h-11 w-11" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em]">
                                <ShieldCheck className="h-4 w-4" />
                                RideWay QR Result
                            </p>
                            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{tone.title}</h1>
                            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 opacity-90">{tone.message}</p>
                        </div>
                    </div>
                </section>

                {verification.booking && (
                    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Trip</p>
                                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                                    {verification.booking.origin} to {verification.booking.destination}
                                </h2>
                            </div>
                            <span className={cn("w-fit rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest", tone.badge)}>
                                {verification.valid ? "Valid For Boarding" : verification.authentic ? "RideWay Record Found" : "Not Verified"}
                            </span>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <DetailRow icon={Calendar} label="Departure" value={departureTime ? format(departureTime, "MMM dd, yyyy") : undefined} />
                            <DetailRow icon={Clock} label="Boarding Time" value={departureTime ? format(departureTime, "hh:mm a") : undefined} />
                            <DetailRow icon={Bus} label="Bus" value={verification.booking.busNumber || undefined} />
                            <DetailRow icon={Ticket} label="Bus Type" value={verification.booking.busType || undefined} />
                            <DetailRow icon={Hash} label="Booking ID" value={verification.booking.id.slice(-8).toUpperCase()} />
                            <DetailRow icon={Clock} label="QR Valid Until" value={arrivalTime ? format(arrivalTime, "MMM dd, yyyy hh:mm a") : undefined} />
                        </div>
                    </section>
                )}

                {Array.isArray(verification.tickets) && verification.tickets.length > 0 && (
                    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Passengers</p>
                                <h2 className="text-xl font-black text-slate-900">{verification.tickets.length} passenger ticket{verification.tickets.length === 1 ? "" : "s"}</h2>
                            </div>
                        </div>

                        <div className="grid gap-3">
                            {verification.tickets.map((ticket) => (
                                <div key={ticket.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-black text-slate-900">{ticket.passengerName}</p>
                                        <p className="text-xs font-bold text-slate-500">Seat {ticket.seatNumber}</p>
                                    </div>
                                    <span className="rounded-xl bg-white px-3 py-1.5 text-xs font-black uppercase tracking-wider text-slate-600">
                                        {ticket.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link href="/driver/scan" className="flex-1">
                        <Button className="h-14 w-full rounded-2xl bg-slate-900 font-black text-white hover:bg-black">
                            Driver Check-In
                        </Button>
                    </Link>
                    <Link href="/track" className="flex-1">
                        <Button variant="outline" className="h-14 w-full rounded-2xl border-slate-200 font-black">
                            Track Ticket
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    )
}
