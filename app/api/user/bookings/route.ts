import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const bookings = await prisma.booking.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                trip: {
                    include: {
                        route: true,
                        bus: true,
                    },
                },
                tickets: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(bookings);
    } catch (error: any) {
        console.error('Fetch Bookings Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
