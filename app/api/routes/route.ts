import { NextResponse } from 'next/server';
import { TripStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const bookableTripStatuses: TripStatus[] = ['SCHEDULED', 'BOARDING', 'DELAYED'];
const sriLankaUtcOffsetMs = 5.5 * 60 * 60 * 1000;

function toSriLankaDateInputValue(value?: Date | null) {
    if (!value) return null;
    const sriLankaDate = new Date(value.getTime() + sriLankaUtcOffsetMs);

    return [
        sriLankaDate.getUTCFullYear(),
        String(sriLankaDate.getUTCMonth() + 1).padStart(2, '0'),
        String(sriLankaDate.getUTCDate()).padStart(2, '0'),
    ].join('-');
}

export async function GET() {
    try {
        const routes = await prisma.route.findMany({
            orderBy: { name: 'asc' },
            include: {
                trips: {
                    where: {
                        status: { in: bookableTripStatuses },
                    },
                    orderBy: { departureTime: 'asc' },
                    take: 1,
                    select: {
                        basePrice: true,
                        departureTime: true,
                    },
                },
            },
        });

        const payload = routes.map(({ trips, ...route }) => ({
            ...route,
            basePrice: trips[0]?.basePrice ?? null,
            nextTripDate: toSriLankaDateInputValue(trips[0]?.departureTime),
        }));

        return NextResponse.json(payload, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
