import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [userCount, busCount, bookingCount, revenueResult, recentBookings, recentTrips] = await Promise.all([
            prisma.user.count(),
            prisma.bus.count(),
            prisma.booking.count(),
            prisma.booking.aggregate({
                _sum: {
                    totalAmount: true
                }
            }),
            prisma.booking.findMany({
                take: 5,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    user: true
                }
            }),
            prisma.trip.findMany({
                where: {
                    status: { not: 'SCHEDULED' }
                },
                take: 5,
                orderBy: {
                    updatedAt: 'desc'
                },
                include: {
                    driver: true,
                    route: true
                }
            })
        ]);

        const stats = [
            { title: "Total Revenue", value: `LKR ${(revenueResult._sum.totalAmount || 0).toLocaleString()}`, trend: "+12.5%", icon: "DollarSign", color: "text-blue-600", bg: "bg-blue-50" },
            { title: "Active Bookings", value: bookingCount.toLocaleString(), trend: "+5.1%", icon: "CalendarCheck", color: "text-emerald-600", bg: "bg-emerald-50" },
            { title: "Active Buses", value: busCount.toLocaleString(), trend: "+2 this week", icon: "Bus", color: "text-amber-600", bg: "bg-amber-50" },
            { title: "Total Users", value: userCount.toLocaleString(), trend: "+10.2%", icon: "Users", color: "text-indigo-600", bg: "bg-indigo-50" }
        ];

        const activities = [
            ...recentBookings.map(b => ({
                user: b.user.name || "Anonymous",
                action: `booked a ticket (ID: ${b.id.slice(-6)})`,
                time: "Recently",
                date: b.createdAt
            })),
            ...recentTrips.map(t => ({
                user: t.driver?.name || "Driver",
                action: `${t.status === 'IN_TRANSIT' ? 'started' : t.status.toLowerCase()} trip to ${t.route.destination}`,
                time: "Recently",
                date: t.updatedAt
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

        return NextResponse.json({ stats, activity: activities });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
