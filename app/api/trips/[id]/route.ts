
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const { id: tripId } = await props.params;
        if (!tripId) return NextResponse.json({ error: 'Missing trip ID' }, { status: 400 });

        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                bus: true,
                route: true,
            },
        });

        if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

        return NextResponse.json(trip);
    } catch (error: any) {
        console.error('Fetch Trip API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const { id: tripId } = await props.params;
        const { status } = await req.json();

        const updatedTrip = await prisma.trip.update({
            where: { id: tripId },
            data: { status }
        });

        return NextResponse.json(updatedTrip);
    } catch (error: any) {
        console.error('Update Trip API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
