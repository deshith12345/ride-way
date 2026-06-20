import { NextResponse } from 'next/server';
import { TripStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const bookableTripStatuses: TripStatus[] = ['SCHEDULED', 'BOARDING', 'DELAYED'];

export async function GET() {
    try {
        const [userCount, routeCount, tripCount] = await Promise.all([
            prisma.user.count({ where: { role: 'TRAVELLER' } }),
            prisma.route.count(),
            prisma.trip.count({ where: { status: { in: bookableTripStatuses } } })
        ]);

        return NextResponse.json({
            travelers: userCount,
            routes: routeCount,
            scheduledTrips: tripCount
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
