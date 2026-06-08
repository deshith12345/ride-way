
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// PATCH - update user role
export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await props.params;
        const { role } = await req.json();

        if (!['ADMIN', 'DRIVER', 'TRAVELLER'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // Prevent admin from changing their own role
        if (id === session.user.id) {
            return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, name: true, email: true, role: true },
        });

        return NextResponse.json(user);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - remove user
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

        // Prevent admin from deleting themselves
        if (id === session.user.id) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
        }

        await prisma.user.delete({ where: { id } });

        return NextResponse.json({ message: 'User deleted' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
