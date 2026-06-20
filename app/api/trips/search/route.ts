import { NextResponse } from 'next/server';
import { TripStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const bookableTripStatuses: TripStatus[] = ['SCHEDULED', 'BOARDING', 'DELAYED'];
const sriLankaUtcOffsetMs = 5.5 * 60 * 60 * 1000;

function getSriLankaDayRange(date: string) {
    const [year, month, day] = date.split('-').map(Number);
    if (!year || !month || !day) return null;

    const startUtc = new Date(Date.UTC(year, month - 1, day) - sriLankaUtcOffsetMs);
    const endUtc = new Date(Date.UTC(year, month - 1, day + 1) - sriLankaUtcOffsetMs);

    if (Number.isNaN(startUtc.getTime()) || Number.isNaN(endUtc.getTime())) return null;
    return { startUtc, endUtc };
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const date = searchParams.get('date');

        const where: any = {
            status: { in: bookableTripStatuses },
            departureTime: {
                gte: new Date()
            }
        };

        if (from || to) {
            const routeWhere: any = {};
            if (from) {
                routeWhere.origin = { contains: from, mode: 'insensitive' };
            }
            if (to) {
                routeWhere.destination = { contains: to, mode: 'insensitive' };
            }

            const matchingRoutes = await prisma.route.findMany({
                where: routeWhere,
                select: { id: true },
            });

            if (matchingRoutes.length === 0) {
                return NextResponse.json([], {
                    headers: {
                        'Cache-Control': 'no-store, max-age=0',
                    },
                });
            }

            where.routeId = { in: matchingRoutes.map((route) => route.id) };
        }

        if (date) {
            const dayRange = getSriLankaDayRange(date);
            if (!dayRange) {
                return NextResponse.json({ error: 'Invalid travel date' }, { status: 400 });
            }

            const now = new Date();

            where.departureTime = {
                gte: dayRange.startUtc > now ? dayRange.startUtc : now,
                lt: dayRange.endUtc
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

        return NextResponse.json(trips, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error: any) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
