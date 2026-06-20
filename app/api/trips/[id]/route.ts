
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { normalizeRole } from '@/lib/authz';

const tripStatuses = ['SCHEDULED', 'BOARDING', 'DEPARTED', 'IN_TRANSIT', 'ARRIVED', 'COMPLETED', 'CANCELLED', 'DELAYED'] as const;

function cleanOptionalId(value: unknown) {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
}

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
        const role = normalizeRole(session?.user?.role);
        if (!session?.user || !role || !['ADMIN', 'DRIVER'].includes(role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: tripId } = await props.params;
        const body = await req.json();
        const { status } = body;

        if (status !== undefined && !tripStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid trip status' }, { status: 400 });
        }

        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            select: { id: true, driverId: true },
        });

        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        if (role === 'DRIVER' && trip.driverId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (role === 'DRIVER') {
            const updatedTrip = await prisma.trip.update({
                where: { id: tripId },
                data: { status }
            });

            return NextResponse.json(updatedTrip);
        }

        const data: any = {};

        if (status !== undefined) data.status = status;

        if (body.routeId !== undefined) {
            const routeId = cleanOptionalId(body.routeId);
            if (!routeId) return NextResponse.json({ error: 'Route is required' }, { status: 400 });
            const route = await prisma.route.findUnique({ where: { id: routeId }, select: { id: true } });
            if (!route) return NextResponse.json({ error: 'Route not found' }, { status: 404 });
            data.routeId = routeId;
        }

        if (body.busId !== undefined) {
            const busId = cleanOptionalId(body.busId);
            if (!busId) return NextResponse.json({ error: 'Bus is required' }, { status: 400 });
            const bus = await prisma.bus.findUnique({ where: { id: busId }, select: { id: true, isActive: true } });
            if (!bus || !bus.isActive) return NextResponse.json({ error: 'Active bus not found' }, { status: 404 });
            data.busId = busId;
        }

        if (body.driverId !== undefined) {
            const driverId = cleanOptionalId(body.driverId);
            if (driverId) {
                const driver = await prisma.user.findFirst({ where: { id: driverId, role: 'DRIVER' }, select: { id: true } });
                if (!driver) return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
            }
            data.driverId = driverId;
        }

        if (body.basePrice !== undefined) {
            const parsedPrice = Number(body.basePrice);
            if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
                return NextResponse.json({ error: 'Base price must be a positive number' }, { status: 400 });
            }
            data.basePrice = parsedPrice;
        }

        if (body.departureTime !== undefined) {
            const parsedDeparture = new Date(body.departureTime);
            if (Number.isNaN(parsedDeparture.getTime())) {
                return NextResponse.json({ error: 'Invalid departure time' }, { status: 400 });
            }
            data.departureTime = parsedDeparture;
        }

        if (body.arrivalTime !== undefined) {
            const parsedArrival = new Date(body.arrivalTime);
            if (Number.isNaN(parsedArrival.getTime())) {
                return NextResponse.json({ error: 'Invalid arrival time' }, { status: 400 });
            }
            data.arrivalTime = parsedArrival;
        }

        const departureForValidation = data.departureTime ?? (await prisma.trip.findUnique({ where: { id: tripId }, select: { departureTime: true } }))?.departureTime;
        const arrivalForValidation = data.arrivalTime ?? (await prisma.trip.findUnique({ where: { id: tripId }, select: { arrivalTime: true } }))?.arrivalTime;

        if (departureForValidation && arrivalForValidation && arrivalForValidation <= departureForValidation) {
            return NextResponse.json({ error: 'Arrival time must be after departure time' }, { status: 400 });
        }

        const updatedTrip = await prisma.trip.update({
            where: { id: tripId },
            data,
            include: {
                bus: true,
                route: true,
                driver: {
                    select: { name: true, email: true }
                }
            }
        });

        return NextResponse.json(updatedTrip);
    } catch (error: any) {
        console.error('Update Trip API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || normalizeRole(session.user.role) !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: tripId } = await props.params;
        const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { id: true } });
        if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

        const bookings = await prisma.booking.findMany({
            where: { tripId },
            select: { id: true },
        });
        const bookingIds = bookings.map((booking) => booking.id);

        if (bookingIds.length > 0) {
            await prisma.ticket.deleteMany({ where: { bookingId: { in: bookingIds } } });
            await prisma.payment.deleteMany({ where: { bookingId: { in: bookingIds } } });
            await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
        }

        await prisma.trip.delete({ where: { id: tripId } });

        return NextResponse.json({ message: 'Schedule deleted' });
    } catch (error: any) {
        console.error('Delete Trip API Error:', error);
        return NextResponse.json({ error: error.message || 'Unable to delete schedule' }, { status: 500 });
    }
}
