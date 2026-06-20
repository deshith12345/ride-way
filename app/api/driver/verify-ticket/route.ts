import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

function cleanCode(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
}

function isObjectId(value: string) {
    return /^[a-f\d]{24}$/i.test(value);
}

function uniqueStrings(values: unknown[]) {
    return Array.from(new Set(values.filter((value): value is string => typeof value === 'string' && Boolean(value.trim())).map((value) => value.trim())));
}

function normalizeTickets(value: unknown) {
    if (!Array.isArray(value)) return { ticketIds: [] as string[], qrCodes: [] as string[] };

    const ticketIds: string[] = [];
    const qrCodes: string[] = [];

    value.forEach((item) => {
        if (!item || typeof item !== 'object') return;
        const ticketId = cleanCode((item as any).ticketId);
        const qrCode = cleanCode((item as any).qrCode);
        if (ticketId) ticketIds.push(ticketId);
        if (qrCode) qrCodes.push(qrCode);
    });

    return {
        ticketIds: uniqueStrings(ticketIds),
        qrCodes: uniqueStrings(qrCodes),
    };
}

function ticketPayload(ticket: any) {
    return {
        id: ticket.id,
        seatNumber: ticket.seatNumber,
        passengerName: ticket.passengerName,
        status: ticket.status,
    };
}

function bookingPayload(booking: any) {
    const route = booking.trip.route.name || `${booking.trip.route.origin} to ${booking.trip.route.destination}`;

    return {
        id: booking.id,
        route,
        busNumber: booking.trip.bus?.registrationNo,
        departureTime: booking.trip.departureTime,
        arrivalTime: booking.trip.arrivalTime,
        passenger: booking.user?.name || booking.user?.email || 'Traveller',
    };
}

function authenticityResponse({
    status,
    error,
    booking,
    tickets,
    authentic = true,
    expired = false,
    alreadyUsed = false,
}: {
    status: number
    error: string
    booking?: any
    tickets?: any[]
    authentic?: boolean
    expired?: boolean
    alreadyUsed?: boolean
}) {
    return NextResponse.json({
        valid: false,
        authentic,
        expired,
        alreadyUsed,
        error,
        booking: booking ? bookingPayload(booking) : undefined,
        tickets: tickets?.map(ticketPayload),
    }, { status });
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'DRIVER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const qrCode = cleanCode(body.qrCode);
        const ticketId = cleanCode(body.ticketId);
        const bookingId = cleanCode(body.bookingId);
        const normalizedTickets = normalizeTickets(body.tickets);
        const qrCodes = uniqueStrings([qrCode, ...(Array.isArray(body.qrCodes) ? body.qrCodes : []), ...normalizedTickets.qrCodes]);
        const ticketIds = uniqueStrings([ticketId, ...(Array.isArray(body.ticketIds) ? body.ticketIds : []), ...normalizedTickets.ticketIds]).filter(isObjectId);

        if (bookingId && !isObjectId(bookingId)) {
            return authenticityResponse({
                status: 400,
                error: 'Fake or malformed RideWay QR',
                authentic: false,
            });
        }

        if (bookingId) {
            if (qrCodes.length === 0 && ticketIds.length === 0) {
                return authenticityResponse({
                    status: 400,
                    error: 'Booking QR is missing ticket security tokens',
                    authentic: false,
                });
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
            });

            if (!booking) {
                return authenticityResponse({
                    status: 404,
                    error: 'Fake ticket: booking was not found',
                    authentic: false,
                });
            }

            const bookingTicketIds = new Set(booking.tickets.map((ticket) => ticket.id));
            const bookingSecurityTokens = new Set(booking.tickets.flatMap((ticket) => [ticket.id, ticket.qrCode].filter(Boolean)));
            const ticketIdsMatch = ticketIds.every((id) => bookingTicketIds.has(id));
            const qrCodesMatch = qrCodes.every((code) => bookingSecurityTokens.has(code));
            const hasEveryBookingTicket =
                booking.tickets.length > 0 &&
                booking.tickets.every((ticket) => ticketIds.includes(ticket.id) || qrCodes.includes(ticket.id) || (ticket.qrCode && qrCodes.includes(ticket.qrCode)));

            if (!ticketIdsMatch || !qrCodesMatch || !hasEveryBookingTicket) {
                return authenticityResponse({
                    status: 400,
                    error: 'Fake or tampered QR: ticket tokens do not match this booking',
                    authentic: false,
                    booking,
                });
            }

            if (!['CONFIRMED', 'COMPLETED'].includes(booking.status) || booking.paymentStatus !== 'PAID') {
                return authenticityResponse({
                    status: 400,
                    error: 'Authentic ticket, but booking is not confirmed for boarding',
                    booking,
                    tickets: booking.tickets,
                });
            }

            if (booking.trip.arrivalTime <= new Date()) {
                return authenticityResponse({
                    status: 410,
                    error: 'Authentic ticket, but QR expired after this trip ended',
                    booking,
                    tickets: booking.tickets,
                    expired: true,
                });
            }

            if (booking.trip.driverId !== session.user.id) {
                return authenticityResponse({
                    status: 403,
                    error: 'Authentic ticket, but it is not for your assigned trip',
                    booking,
                    tickets: booking.tickets,
                });
            }

            if (booking.tickets.every((ticket) => ticket.status === 'USED')) {
                return authenticityResponse({
                    status: 409,
                    error: 'Authentic ticket, but all passengers are already checked in',
                    booking,
                    tickets: booking.tickets,
                    alreadyUsed: true,
                });
            }

            const unusableTicket = booking.tickets.find((ticket) => ticket.status !== 'VALID' && ticket.status !== 'USED');
            if (unusableTicket) {
                return authenticityResponse({
                    status: 400,
                    error: `Authentic ticket, but seat ${unusableTicket.seatNumber} is ${unusableTicket.status}`,
                    booking,
                    tickets: booking.tickets,
                });
            }

            const validTicketIds = booking.tickets.filter((ticket) => ticket.status === 'VALID').map((ticket) => ticket.id);
            if (validTicketIds.length > 0) {
                await prisma.ticket.updateMany({
                    where: { id: { in: validTicketIds } },
                    data: { status: 'USED' },
                });
            }

            const updatedTickets = booking.tickets.map((ticket) => ({
                ...ticket,
                status: validTicketIds.includes(ticket.id) ? 'USED' : ticket.status,
            }));

            return NextResponse.json({
                valid: true,
                authentic: true,
                message: 'Authentic ticket. All passengers checked in successfully.',
                booking: bookingPayload(booking),
                tickets: updatedTickets.map(ticketPayload),
            });
        }

        const filters = [];
        if (qrCodes.length > 0) filters.push({ qrCode: { in: qrCodes } });
        if (ticketIds.length > 0) filters.push({ id: { in: ticketIds } });

        if (filters.length === 0) {
            return authenticityResponse({
                status: 400,
                error: 'QR code or ticket ID required',
                authentic: false,
            });
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
        });

        if (!ticket) {
            return authenticityResponse({
                status: 404,
                error: 'Fake ticket: no matching RideWay ticket was found',
                authentic: false,
            });
        }

        const booking = ticket.booking;

        if (!['CONFIRMED', 'COMPLETED'].includes(booking.status) || booking.paymentStatus !== 'PAID') {
            return authenticityResponse({
                status: 400,
                error: 'Authentic ticket, but booking is not confirmed for boarding',
                booking,
                tickets: [ticket],
            });
        }

        if (booking.trip.arrivalTime <= new Date()) {
            return authenticityResponse({
                status: 410,
                error: 'Authentic ticket, but QR expired after this trip ended',
                booking,
                tickets: [ticket],
                expired: true,
            });
        }

        if (booking.trip.driverId !== session.user.id) {
            return authenticityResponse({
                status: 403,
                error: 'Authentic ticket, but it is not for your assigned trip',
                booking,
                tickets: [ticket],
            });
        }

        if (ticket.status === 'USED') {
            return authenticityResponse({
                status: 409,
                error: 'Authentic ticket, but passenger is already checked in',
                booking,
                tickets: [ticket],
                alreadyUsed: true,
            });
        }

        if (ticket.status !== 'VALID') {
            return authenticityResponse({
                status: 400,
                error: `Authentic ticket, but ticket status is ${ticket.status}`,
                booking,
                tickets: [ticket],
            });
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id: ticket.id },
            data: { status: 'USED' },
        });

        return NextResponse.json({
            valid: true,
            authentic: true,
            message: 'Authentic ticket. Passenger checked in successfully.',
            booking: bookingPayload(booking),
            tickets: [ticketPayload(updatedTicket)],
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
