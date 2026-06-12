
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const { id: tripId } = await props.params;
        if (!tripId) return NextResponse.json({ error: 'Missing trip ID' }, { status: 400 });

        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                bus: true,
                route: true,
            },
        });

        if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

        return NextResponse.json(trip);
    } catch (error: any) {
        console.error('Fetch Trip API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || !['ADMIN', 'DRIVER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: tripId } = await props.params;
        const { status } = await req.json();

        if (!['SCHEDULED', 'BOARDING', 'DEPARTED', 'IN_TRANSIT', 'ARRIVED', 'COMPLETED', 'CANCELLED', 'DELAYED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid trip status' }, { status: 400 });
        }

        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            select: { driverId: true },
        });

        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        if (session.user.role === 'DRIVER' && trip.driverId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updatedTrip = await prisma.trip.update({
            where: { id: tripId },
            data: { status }
        });

        return NextResponse.json(updatedTrip);
    } catch (error: any) {
        console.error('Update Trip API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
