import { prisma } from "@/lib/prisma"

const objectIdPattern = /^[a-f\d]{24}$/i

export type TicketVerificationInput = {
    v?: unknown
    verification?: unknown
    bookingId?: unknown
    ticketId?: unknown
    qrCode?: unknown
    ticketIds?: unknown
    qrCodes?: unknown
    tickets?: unknown
}

export type TicketVerificationResult = {
    valid: boolean
    authentic: boolean
    expired?: boolean
    alreadyUsed?: boolean
    checkedIn?: boolean
    error?: string
    message?: string
    httpStatus: number
    booking?: {
        id: string
        route: string
        origin: string
        destination: string
        busNumber?: string | null
        busType?: string | null
        departureTime: Date
        arrivalTime: Date
        passenger: string
        status: string
        paymentStatus: string
    }
    tickets?: Array<{
        id: string
        seatNumber: string
        passengerName: string
        status: string
    }>
}

function cleanCode(value: unknown) {
    return typeof value === "string" ? value.trim() : ""
}

function isObjectId(value: string) {
    return objectIdPattern.test(value)
}

function uniqueStrings(values: unknown[]) {
    return Array.from(
        new Set(
            values
                .filter((value): value is string => typeof value === "string" && Boolean(value.trim()))
                .map((value) => value.trim())
        )
    )
}

function normalizeArray(value: unknown) {
    if (Array.isArray(value)) return value
    if (typeof value === "string") return value.split(",")
    return []
}

function normalizeTickets(value: unknown) {
    if (!Array.isArray(value)) return { ticketIds: [] as string[], qrCodes: [] as string[] }

    const ticketIds: string[] = []
    const qrCodes: string[] = []

    value.forEach((item) => {
        if (!item || typeof item !== "object") return
        const ticketId = cleanCode((item as any).ticketId)
        const qrCode = cleanCode((item as any).qrCode)
        if (ticketId) ticketIds.push(ticketId)
        if (qrCode) qrCodes.push(qrCode)
    })

    return {
        ticketIds: uniqueStrings(ticketIds),
        qrCodes: uniqueStrings(qrCodes),
    }
}

function ticketPayload(ticket: any) {
    return {
        id: ticket.id,
        seatNumber: ticket.seatNumber,
        passengerName: ticket.passengerName,
        status: ticket.status,
    }
}

function bookingPayload(booking: any) {
    const route = booking.trip.route.name || `${booking.trip.route.origin} to ${booking.trip.route.destination}`

    return {
        id: booking.id,
        route,
        origin: booking.trip.route.origin,
        destination: booking.trip.route.destination,
        busNumber: booking.trip.bus?.registrationNo,
        busType: booking.trip.bus?.type,
        departureTime: booking.trip.departureTime,
        arrivalTime: booking.trip.arrivalTime,
        passenger: booking.user?.name || booking.user?.email || "Traveller",
        status: booking.status,
        paymentStatus: booking.paymentStatus,
    }
}

function result({
    httpStatus,
    error,
    message,
    booking,
    tickets,
    valid = false,
    authentic = true,
    expired = false,
    alreadyUsed = false,
    checkedIn = false,
}: {
    httpStatus: number
    error?: string
    message?: string
    booking?: any
    tickets?: any[]
    valid?: boolean
    authentic?: boolean
    expired?: boolean
    alreadyUsed?: boolean
    checkedIn?: boolean
}): TicketVerificationResult {
    return {
        valid,
        authentic,
        expired,
        alreadyUsed,
        checkedIn,
        error,
        message,
        httpStatus,
        booking: booking ? bookingPayload(booking) : undefined,
        tickets: tickets?.map(ticketPayload),
    }
}

export function normalizeTicketVerificationInput(input: TicketVerificationInput) {
    const normalizedTickets = normalizeTickets(input.tickets)
    const qrCode = cleanCode(input.qrCode)
    const ticketId = cleanCode(input.ticketId)
    const bookingId = cleanCode(input.bookingId)
    const qrCodes = uniqueStrings([
        qrCode,
        ...normalizeArray(input.qrCodes),
        ...normalizedTickets.qrCodes,
    ])
    const ticketIds = uniqueStrings([
        ticketId,
        ...normalizeArray(input.ticketIds),
        ...normalizedTickets.ticketIds,
    ]).filter(isObjectId)

    return {
        bookingId,
        qrCodes,
        ticketIds,
    }
}

export function decodeTicketVerificationInput(value: string): TicketVerificationInput | null {
    try {
        const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=")
        const decoded = Buffer.from(padded, "base64").toString("utf8")
        const parsed = JSON.parse(decoded)

        if (!parsed || typeof parsed !== "object") return null

        return {
            bookingId: (parsed as any).b || (parsed as any).bookingId,
            tickets: Array.isArray((parsed as any).t)
                ? (parsed as any).t.map((ticket: any) => ({
                    ticketId: ticket?.i || ticket?.ticketId,
                    qrCode: ticket?.q || ticket?.qrCode,
                }))
                : (parsed as any).tickets,
        }
    } catch {
        return null
    }
}

export function ticketVerificationInputFromSearchParams(searchParams: Record<string, string | string[] | undefined>) {
    const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value
    const encoded = first(searchParams.v)

    if (encoded) {
        const decodedInput = decodeTicketVerificationInput(encoded)
        if (decodedInput) return decodedInput
        return null
    }

    return {
        bookingId: first(searchParams.b) || first(searchParams.bookingId),
        qrCode: first(searchParams.qrCode) || first(searchParams.q),
        ticketId: first(searchParams.ticketId) || first(searchParams.id),
        qrCodes: first(searchParams.tokens) || first(searchParams.qrCodes),
        ticketIds: first(searchParams.ticketIds),
    }
}

export async function verifyTicketAuthenticity(
    input: TicketVerificationInput,
    options: {
        driverId?: string
        requireAssignedDriver?: boolean
        consume?: boolean
    } = {}
) {
    const encodedValue = cleanCode(input.v) || cleanCode(input.verification)
    if (encodedValue) {
        const decodedInput = decodeTicketVerificationInput(encodedValue)
        if (!decodedInput) {
            return result({
                httpStatus: 400,
                error: "Fake or malformed RideWay QR",
                authentic: false,
            })
        }

        return verifyTicketAuthenticity(decodedInput, options)
    }

    const { bookingId, qrCodes, ticketIds } = normalizeTicketVerificationInput(input)

    if (bookingId && !isObjectId(bookingId)) {
        return result({
            httpStatus: 400,
            error: "Fake or malformed RideWay QR",
            authentic: false,
        })
    }

    if (bookingId) {
        if (qrCodes.length === 0 && ticketIds.length === 0) {
            return result({
                httpStatus: 400,
                error: "Booking QR is missing ticket security tokens",
                authentic: false,
            })
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                tickets: true,
                trip: {
                    include: {
                        route: true,
                        bus: true,
                    },
                },
                user: {
                    select: { name: true, email: true },
                },
            },
        })

        if (!booking) {
            return result({
                httpStatus: 404,
                error: "Fake ticket: booking was not found",
                authentic: false,
            })
        }

        const bookingTicketIds = new Set(booking.tickets.map((ticket) => ticket.id))
        const bookingSecurityTokens = new Set(booking.tickets.flatMap((ticket) => [ticket.id, ticket.qrCode].filter(Boolean)))
        const ticketIdsMatch = ticketIds.every((id) => bookingTicketIds.has(id))
        const qrCodesMatch = qrCodes.every((code) => bookingSecurityTokens.has(code))
        const hasEveryBookingTicket =
            booking.tickets.length > 0 &&
            booking.tickets.every((ticket) => (
                ticketIds.includes(ticket.id) ||
                qrCodes.includes(ticket.id) ||
                (ticket.qrCode && qrCodes.includes(ticket.qrCode))
            ))

        if (!ticketIdsMatch || !qrCodesMatch || !hasEveryBookingTicket) {
            return result({
                httpStatus: 400,
                error: "Fake or tampered QR: ticket tokens do not match this booking",
                authentic: false,
                booking,
            })
        }

        if (!["CONFIRMED", "COMPLETED"].includes(booking.status) || booking.paymentStatus !== "PAID") {
            return result({
                httpStatus: 400,
                error: "Authentic ticket, but booking is not confirmed for boarding",
                booking,
                tickets: booking.tickets,
            })
        }

        if (booking.trip.arrivalTime <= new Date()) {
            return result({
                httpStatus: 410,
                error: "Authentic ticket, but QR expired after this trip ended",
                booking,
                tickets: booking.tickets,
                expired: true,
            })
        }

        if (options.requireAssignedDriver && booking.trip.driverId !== options.driverId) {
            return result({
                httpStatus: 403,
                error: "Authentic ticket, but it is not for your assigned trip",
                booking,
                tickets: booking.tickets,
            })
        }

        if (booking.tickets.every((ticket) => ticket.status === "USED")) {
            return result({
                httpStatus: 409,
                error: "Authentic ticket, but all passengers are already checked in",
                booking,
                tickets: booking.tickets,
                alreadyUsed: true,
            })
        }

        const unusableTicket = booking.tickets.find((ticket) => ticket.status !== "VALID" && ticket.status !== "USED")
        if (unusableTicket) {
            return result({
                httpStatus: 400,
                error: `Authentic ticket, but seat ${unusableTicket.seatNumber} is ${unusableTicket.status}`,
                booking,
                tickets: booking.tickets,
            })
        }

        if (!options.consume) {
            return result({
                httpStatus: 200,
                valid: true,
                authentic: true,
                message: "Authentic RideWay ticket. Valid for this trip.",
                booking,
                tickets: booking.tickets,
            })
        }

        const validTicketIds = booking.tickets.filter((ticket) => ticket.status === "VALID").map((ticket) => ticket.id)
        if (validTicketIds.length > 0) {
            await prisma.ticket.updateMany({
                where: { id: { in: validTicketIds } },
                data: { status: "USED" },
            })
        }

        const updatedTickets = booking.tickets.map((ticket) => ({
            ...ticket,
            status: validTicketIds.includes(ticket.id) ? "USED" : ticket.status,
        }))

        return result({
            httpStatus: 200,
            valid: true,
            authentic: true,
            checkedIn: true,
            message: "Authentic ticket. All passengers checked in successfully.",
            booking,
            tickets: updatedTickets,
        })
    }

    const filters = []
    if (qrCodes.length > 0) filters.push({ qrCode: { in: qrCodes } })
    if (ticketIds.length > 0) filters.push({ id: { in: ticketIds } })

    if (filters.length === 0) {
        return result({
            httpStatus: 400,
            error: "QR code or ticket ID required",
            authentic: false,
        })
    }

    const ticket = await prisma.ticket.findFirst({
        where: { OR: filters },
        include: {
            booking: {
                include: {
                    tickets: true,
                    trip: {
                        include: {
                            route: true,
                            bus: true,
                        },
                    },
                    user: {
                        select: { name: true, email: true },
                    },
                },
            },
        },
    })

    if (!ticket) {
        return result({
            httpStatus: 404,
            error: "Fake ticket: no matching RideWay ticket was found",
            authentic: false,
        })
    }

    const booking = ticket.booking

    if (!["CONFIRMED", "COMPLETED"].includes(booking.status) || booking.paymentStatus !== "PAID") {
        return result({
            httpStatus: 400,
            error: "Authentic ticket, but booking is not confirmed for boarding",
            booking,
            tickets: [ticket],
        })
    }

    if (booking.trip.arrivalTime <= new Date()) {
        return result({
            httpStatus: 410,
            error: "Authentic ticket, but QR expired after this trip ended",
            booking,
            tickets: [ticket],
            expired: true,
        })
    }

    if (options.requireAssignedDriver && booking.trip.driverId !== options.driverId) {
        return result({
            httpStatus: 403,
            error: "Authentic ticket, but it is not for your assigned trip",
            booking,
            tickets: [ticket],
        })
    }

    if (ticket.status === "USED") {
        return result({
            httpStatus: 409,
            error: "Authentic ticket, but passenger is already checked in",
            booking,
            tickets: [ticket],
            alreadyUsed: true,
        })
    }

    if (ticket.status !== "VALID") {
        return result({
            httpStatus: 400,
            error: `Authentic ticket, but ticket status is ${ticket.status}`,
            booking,
            tickets: [ticket],
        })
    }

    if (!options.consume) {
        return result({
            httpStatus: 200,
            valid: true,
            authentic: true,
            message: "Authentic RideWay ticket. Valid for this trip.",
            booking,
            tickets: [ticket],
        })
    }

    const updatedTicket = await prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: "USED" },
    })

    return result({
        httpStatus: 200,
        valid: true,
        authentic: true,
        checkedIn: true,
        message: "Authentic ticket. Passenger checked in successfully.",
        booking,
        tickets: [updatedTicket],
    })
}
