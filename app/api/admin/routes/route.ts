
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

function cleanText(value: unknown) {
    return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function optionalPositiveNumber(value: unknown) {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const routes = await prisma.route.findMany({
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(routes);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const name = cleanText(body.name);
        const origin = cleanText(body.origin);
        const destination = cleanText(body.destination);
        const parsedDistance = optionalPositiveNumber(body.totalDistance);
        const parsedDuration = optionalPositiveNumber(body.estimatedDuration);

        if (!name || !origin || !destination) {
            return NextResponse.json({ error: 'Route name, origin, and destination are required' }, { status: 400 });
        }

        if ((body.totalDistance || body.estimatedDuration) && (!parsedDistance || !parsedDuration)) {
            return NextResponse.json({ error: 'Distance and duration must be positive numbers' }, { status: 400 });
        }

        const route = await prisma.route.create({
            data: {
                name,
                origin,
                destination,
                totalDistance: parsedDistance,
                estimatedDuration: parsedDuration ? Math.round(parsedDuration) : null
            }
        });

        return NextResponse.json(route);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
