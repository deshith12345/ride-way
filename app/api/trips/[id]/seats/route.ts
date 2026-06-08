
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET booked seats for a trip
export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await props.params;

        const trip = await prisma.trip.findUnique({
            where: { id },
            include: {
                bus: { select: { totalSeats: true } },
            }
        });

        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        // Get all tickets for confirmed/completed bookings on this trip
        const bookedTickets = await prisma.ticket.findMany({
            where: {
                booking: {
                    tripId: id,
                    status: { in: ['CONFIRMED', 'COMPLETED'] },
                },
            },
            select: {
                seatNumber: true,
                passengerGender: true,
                status: true,
            },
        });

        const bookedSeats = bookedTickets.map(t => ({
            seatNumber: t.seatNumber,
            gender: t.passengerGender || 'male',
            status: t.status,
        }));

        return NextResponse.json({
            totalSeats: trip.bus?.totalSeats || 45,
            bookedSeats,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
