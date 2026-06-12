
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

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

        const { name, origin, destination, totalDistance, estimatedDuration } = await req.json();

        if (!name || !origin || !destination) {
            return NextResponse.json({ error: 'Route name, origin, and destination are required' }, { status: 400 });
        }

        const route = await prisma.route.create({
            data: { name, origin, destination, totalDistance, estimatedDuration }
        });

        return NextResponse.json(route);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
