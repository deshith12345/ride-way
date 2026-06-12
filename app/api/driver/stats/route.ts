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
        const totalTrips = await prisma.trip.count({ where: { driverId } });
        const completedTrips = await prisma.trip.count({ where: { driverId, status: 'COMPLETED' } });
        const completionRate = totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0;

        const performance = {
            score: completionRate,
            totalTrips,
            completedTrips,
            completionRate,
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
