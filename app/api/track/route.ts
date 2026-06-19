import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function cleanQuery(value: string | null) {
    return (value || "").replace(/\s+/g, " ").trim()
}

function isObjectId(value: string) {
    return /^[a-f\d]{24}$/i.test(value)
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const query = cleanQuery(searchParams.get("q"))

        if (!query) {
            return NextResponse.json({ error: "Enter a bus number, ticket ID, or QR value" }, { status: 400 })
        }

        const ticket = await prisma.ticket.findFirst({
            where: isObjectId(query)
                ? { OR: [{ qrCode: query }, { id: query }] }
                : { qrCode: query },
            include: {
                booking: {
                    include: {
                        trip: {
                            include: {
                                route: true,
                                bus: true,
                            },
                        },
                    },
                },
            },
        })

        if (ticket) {
            return NextResponse.json({
                type: "ticket",
                ticket: {
                    id: ticket.id,
                    seatNumber: ticket.seatNumber,
                    passengerName: ticket.passengerName,
                    status: ticket.status,
                },
                booking: {
                    status: ticket.booking.status,
                    paymentStatus: ticket.booking.paymentStatus,
                },
                trip: ticket.booking.trip,
                liveGpsAvailable: false,
            })
        }

        const bus = await prisma.bus.findFirst({
            where: {
                OR: [
                    { registrationNo: { equals: query, mode: "insensitive" } },
                    { number: { equals: query, mode: "insensitive" } },
                ],
            },
        })

        if (!bus) {
            return NextResponse.json({ error: "No matching ticket or bus was found" }, { status: 404 })
        }

        const trip = await prisma.trip.findFirst({
            where: {
                busId: bus.id,
                status: { in: ["SCHEDULED", "BOARDING", "DEPARTED", "IN_TRANSIT", "DELAYED"] },
                arrivalTime: { gte: new Date() },
            },
            include: {
                route: true,
                bus: true,
            },
            orderBy: { departureTime: "asc" },
        })

        return NextResponse.json({
            type: "bus",
            bus,
            trip,
            liveGpsAvailable: false,
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Unable to track this reference" }, { status: 500 })
    }
}
