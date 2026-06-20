import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const routes = await prisma.route.findMany({
            orderBy: { name: 'asc' },
            include: {
                trips: {
                    where: {
                        status: 'SCHEDULED',
                        departureTime: { gte: new Date() },
                    },
                    orderBy: { basePrice: 'asc' },
                    take: 1,
                    select: {
                        basePrice: true,
                    },
                },
            },
        });

        const payload = routes.map(({ trips, ...route }) => ({
            ...route,
            basePrice: trips[0]?.basePrice ?? null,
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
