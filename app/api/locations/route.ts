import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const routes = await prisma.route.findMany({
            select: {
                origin: true,
                destination: true,
            }
        });

        // Get unique cities
        const citiesSet = new Set<string>();
        routes.forEach(route => {
            citiesSet.add(route.origin);
            citiesSet.add(route.destination);
        });

        const cities = Array.from(citiesSet)
            .sort()
            .map(city => ({
                value: city.toLowerCase(),
                label: city
            }));

        return NextResponse.json(cities, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
