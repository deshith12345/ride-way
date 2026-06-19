
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET all trips
export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const trips = await prisma.trip.findMany({
            include: {
                bus: true,
                route: true,
                driver: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { departureTime: 'asc' },
        });

        return NextResponse.json(trips);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST new trip
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { routeId, busId, driverId, departureTime, arrivalTime, basePrice } = body;
        const parsedPrice = Number(basePrice);
        const parsedDeparture = new Date(departureTime);
        const parsedArrival = new Date(arrivalTime);

        if (!routeId || !busId || !departureTime || !arrivalTime || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
            return NextResponse.json({ error: 'Invalid trip details' }, { status: 400 });
        }

        if (Number.isNaN(parsedDeparture.getTime()) || Number.isNaN(parsedArrival.getTime()) || parsedArrival <= parsedDeparture) {
            return NextResponse.json({ error: 'Arrival time must be after departure time' }, { status: 400 });
        }

        const [route, bus, driver] = await Promise.all([
            prisma.route.findUnique({ where: { id: routeId }, select: { id: true } }),
            prisma.bus.findUnique({ where: { id: busId }, select: { id: true, isActive: true } }),
            driverId ? prisma.user.findFirst({ where: { id: driverId, role: 'DRIVER' }, select: { id: true } }) : Promise.resolve(null),
        ]);

        if (!route) return NextResponse.json({ error: 'Route not found' }, { status: 404 });
        if (!bus || !bus.isActive) return NextResponse.json({ error: 'Active bus not found' }, { status: 404 });
        if (driverId && !driver) return NextResponse.json({ error: 'Driver not found' }, { status: 404 });

        const trip = await prisma.trip.create({
            data: {
                routeId,
                busId,
                driverId: driverId || undefined,
                departureTime: parsedDeparture,
                arrivalTime: parsedArrival,
                basePrice: parsedPrice,
                status: 'SCHEDULED'
            },
        });

        return NextResponse.json(trip);
    } catch (error: any) {
        console.error('Trip creation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
