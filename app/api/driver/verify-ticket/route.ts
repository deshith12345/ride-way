
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

function cleanCode(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
}

function isObjectId(value: string) {
    return /^[a-f\d]{24}$/i.test(value);
}

// POST - verify a ticket QR code
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'DRIVER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const qrCode = cleanCode(body.qrCode);
        const ticketId = cleanCode(body.ticketId);
        const filters = [];

        if (qrCode) filters.push({ qrCode });
        if (ticketId && isObjectId(ticketId)) filters.push({ id: ticketId });

        if (filters.length === 0) {
            return NextResponse.json({ error: 'QR code or ticket ID required' }, { status: 400 });
        }

        const ticket = await prisma.ticket.findFirst({
            where: {
                OR: filters,
            },
            include: {
                booking: {
                    include: {
                        trip: {
                            include: {
                                route: true,
                            }
                        },
                        user: {
                            select: { name: true, email: true }
                        }
                    }
                }
            }
        });

        if (!ticket) {
            return NextResponse.json({
                valid: false,
                error: 'Ticket not found'
            }, { status: 404 });
        }

        if (!['CONFIRMED', 'COMPLETED'].includes(ticket.booking.status) || ticket.booking.paymentStatus !== 'PAID') {
            return NextResponse.json({
                valid: false,
                error: 'Booking is not confirmed for boarding'
            }, { status: 400 });
        }

        // Check if ticket is already used
        if (ticket.status === 'USED') {
            return NextResponse.json({
                valid: false,
                error: 'Ticket already checked in',
                ticket: {
                    id: ticket.id,
                    seatNumber: ticket.seatNumber,
                    passengerName: ticket.passengerName,
                    status: ticket.status,
                }
            });
        }

        // Check if ticket is valid
        if (ticket.status !== 'VALID') {
            return NextResponse.json({
                valid: false,
                error: `Ticket status: ${ticket.status}`,
                ticket: {
                    id: ticket.id,
                    seatNumber: ticket.seatNumber,
                    passengerName: ticket.passengerName,
                    status: ticket.status,
                }
            });
        }

        // Verify this ticket belongs to a trip assigned to this driver
        if (ticket.booking.trip.driverId !== session.user.id) {
            return NextResponse.json({
                valid: false,
                error: 'Ticket is not for your assigned trip'
            }, { status: 403 });
        }

        // Mark ticket as used (checked in)
        const updatedTicket = await prisma.ticket.update({
            where: { id: ticket.id },
            data: { status: 'USED' },
        });

        return NextResponse.json({
            valid: true,
            ticket: {
                id: updatedTicket.id,
                seatNumber: updatedTicket.seatNumber,
                passengerName: updatedTicket.passengerName,
                status: updatedTicket.status,
                route: ticket.booking.trip.route.name || `${ticket.booking.trip.route.origin} to ${ticket.booking.trip.route.destination}`,
                passenger: ticket.booking.user?.name || ticket.passengerName,
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
