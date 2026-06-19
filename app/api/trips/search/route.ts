import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const date = searchParams.get('date');

        const where: any = {
            status: 'SCHEDULED',
            departureTime: {
                gte: new Date()
            }
        };

        if (from || to) {
            where.route = {};
            if (from) {
                where.route.origin = { contains: from, mode: 'insensitive' };
            }
            if (to) {
                where.route.destination = { contains: to, mode: 'insensitive' };
            }
        }

        if (date) {
            const searchDate = new Date(date);
            if (Number.isNaN(searchDate.getTime())) {
                return NextResponse.json({ error: 'Invalid travel date' }, { status: 400 });
            }

            const nextDay = new Date(searchDate);
            nextDay.setDate(searchDate.getDate() + 1);

            where.departureTime = {
                gte: searchDate,
                lt: nextDay
            };
        }

        const trips = await prisma.trip.findMany({
            where,
            include: {
                bus: true,
                route: true,
            },
            orderBy: { departureTime: 'asc' },
        });

        return NextResponse.json(trips);
    } catch (error: any) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
