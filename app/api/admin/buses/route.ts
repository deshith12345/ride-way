
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET all buses
export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const buses = await prisma.bus.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(buses);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST new bus
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { registrationNo, number, type, totalSeats, amenities, images } = body;
        const parsedSeatCount = Number(totalSeats);

        if (!registrationNo || !number || !type || !Number.isInteger(parsedSeatCount) || parsedSeatCount < 1 || parsedSeatCount > 80) {
            return NextResponse.json({ error: 'Invalid bus details' }, { status: 400 });
        }

        const bus = await prisma.bus.create({
            data: {
                registrationNo,
                number,
                type,
                totalSeats: parsedSeatCount,
                amenities: Array.isArray(amenities) ? amenities : [],
                images: Array.isArray(images) ? images : [],
            },
        });

        return NextResponse.json(bus);
    } catch (error: any) {
        console.error('Bus creation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
