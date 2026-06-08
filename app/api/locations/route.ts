import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

        return NextResponse.json(cities);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
