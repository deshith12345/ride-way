
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// POST - verify a ticket QR code
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'DRIVER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { qrCode, ticketId } = await req.json();

        if (!qrCode && !ticketId) {
            return NextResponse.json({ error: 'QR code or ticket ID required' }, { status: 400 });
        }

        // Find the ticket
        const where: any = {};
        if (qrCode) where.qrCode = qrCode;
        if (ticketId) where.id = ticketId;

        const ticket = await prisma.ticket.findFirst({
            where,
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
                route: ticket.booking.trip.route.name,
                passenger: ticket.booking.user?.name || ticket.passengerName,
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
