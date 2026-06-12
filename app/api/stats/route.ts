import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const [userCount, routeCount, tripCount] = await Promise.all([
            prisma.user.count({ where: { role: 'TRAVELLER' } }),
            prisma.route.count(),
            prisma.trip.count({ where: { status: 'SCHEDULED', departureTime: { gte: new Date() } } })
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
