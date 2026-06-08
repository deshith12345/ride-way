
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET trip manifest for driver
export async function GET(
    req: Request,
    props: { params: Promise<{ tripId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'DRIVER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { tripId } = await props.params;

        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                route: true,
                bus: true,
                bookings: {
                    where: {
                        status: { in: ['CONFIRMED', 'COMPLETED'] }
                    },
                    include: {
                        user: {
                            select: { name: true, email: true }
                        },
                        tickets: true,
                    },
                },
            },
        });

        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        // Verify the driver is assigned to this trip
        if (trip.driverId !== session.user.id) {
            return NextResponse.json({ error: 'Not assigned to this trip' }, { status: 403 });
        }

        return NextResponse.json(trip);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
