
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { BusType } from '@prisma/client';

const busTypes = ['AC', 'NON_AC', 'LUXURY', 'SUPER_LUXURY', 'HIGHWAY'] as const;

function cleanText(value: unknown) {
    return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

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
        const registrationNo = cleanText(body.registrationNo).toUpperCase();
        const number = cleanText(body.number).toUpperCase();
        const type = cleanText(body.type).toUpperCase();
        const { totalSeats, amenities, images } = body;
        const parsedSeatCount = Number(totalSeats);

        if (!registrationNo || !number || !busTypes.includes(type as (typeof busTypes)[number]) || !Number.isInteger(parsedSeatCount) || parsedSeatCount < 1 || parsedSeatCount > 80) {
            return NextResponse.json({ error: 'Invalid bus details' }, { status: 400 });
        }

        const bus = await prisma.bus.create({
            data: {
                registrationNo,
                number,
                type: type as BusType,
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
