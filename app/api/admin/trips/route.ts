
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET all trips
export async function GET(req: Request) {
    try {
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

        const trip = await prisma.trip.create({
            data: {
                routeId,
                busId,
                driverId,
                departureTime: new Date(departureTime),
                arrivalTime: new Date(arrivalTime),
                basePrice: parseFloat(basePrice),
                status: 'SCHEDULED'
            },
        });

        return NextResponse.json(trip);
    } catch (error: any) {
        console.error('Trip creation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
