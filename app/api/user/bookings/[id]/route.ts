
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// Cancel a booking
export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await props.params;
        const { action } = await req.json();

        if (action !== 'cancel') {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        // Find the booking and verify ownership
        const booking = await prisma.booking.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
            include: { trip: true },
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        if (booking.status === 'CANCELLED') {
            return NextResponse.json({ error: 'Booking already cancelled' }, { status: 400 });
        }

        // Check if trip hasn't departed yet
        if (new Date(booking.trip.departureTime) <= new Date()) {
            return NextResponse.json({ error: 'Cannot cancel a trip that has already departed' }, { status: 400 });
        }

        // Cancel the booking and invalidate tickets
        await prisma.$transaction([
            prisma.booking.update({
                where: { id },
                data: { status: 'CANCELLED' },
            }),
            prisma.ticket.updateMany({
                where: { bookingId: id },
                data: { status: 'CANCELLED' },
            }),
        ]);

        return NextResponse.json({ message: 'Booking cancelled successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
