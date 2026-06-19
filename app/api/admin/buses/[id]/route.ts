import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await props.params;
        const tripCount = await prisma.trip.count({ where: { busId: id } });

        if (tripCount > 0) {
            return NextResponse.json(
                { error: 'This bus is assigned to trips and cannot be deleted.' },
                { status: 409 }
            );
        }

        await prisma.bus.delete({ where: { id } });

        return NextResponse.json({ message: 'Bus deleted' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Unable to delete bus' }, { status: 500 });
    }
}
