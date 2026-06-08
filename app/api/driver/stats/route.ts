import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'DRIVER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const driverId = session.user.id;

        // Fetch assigned trips
        const trips = await prisma.trip.findMany({
            where: {
                driverId: driverId,
                status: 'SCHEDULED'
            },
            include: {
                route: true,
                bus: true,
                _count: {
                    select: { bookings: true }
                }
            },
            orderBy: {
                departureTime: 'asc'
            }
        });

        const activeTrip = trips[0] || null;
        const upcomingTrips = trips.slice(1);

        // Performance stats (mocked for now but could be based on actual data)
        const performance = {
            score: 98,
            totalTrips: await prisma.trip.count({ where: { driverId } }),
            rating: 4.9,
            busNo: activeTrip?.bus?.registrationNo || "Not Assigned",
            busType: activeTrip?.bus?.type || "N/A"
        };

        return NextResponse.json({
            activeTrip,
            upcomingTrips,
            performance
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
