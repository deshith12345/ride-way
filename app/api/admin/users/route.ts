
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET all users (admin only)
export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role') || '';

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (role && role !== 'ALL') {
            where.role = role;
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                phone: true,
                emailVerified: true,
                licenseNumber: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        bookings: true,
                        assignedTrips: true,
                        reviews: true,
                        supportConversations: true,
                    },
                },
                bookings: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        bookingDate: true,
                        totalAmount: true,
                        status: true,
                        paymentStatus: true,
                        createdAt: true,
                        _count: {
                            select: {
                                tickets: true,
                            },
                        },
                        payment: {
                            select: {
                                amount: true,
                                currency: true,
                                method: true,
                                status: true,
                                createdAt: true,
                            },
                        },
                        trip: {
                            select: {
                                id: true,
                                departureTime: true,
                                arrivalTime: true,
                                status: true,
                                route: {
                                    select: {
                                        name: true,
                                        origin: true,
                                        destination: true,
                                    },
                                },
                                bus: {
                                    select: {
                                        registrationNo: true,
                                        type: true,
                                    },
                                },
                                driver: {
                                    select: {
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
                assignedTrips: {
                    take: 5,
                    orderBy: { departureTime: 'desc' },
                    select: {
                        id: true,
                        departureTime: true,
                        arrivalTime: true,
                        status: true,
                        basePrice: true,
                        _count: {
                            select: {
                                bookings: true,
                            },
                        },
                        route: {
                            select: {
                                name: true,
                                origin: true,
                                destination: true,
                            },
                        },
                        bus: {
                            select: {
                                registrationNo: true,
                                type: true,
                                totalSeats: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE selected users (admin only)
export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const ids: string[] = Array.isArray(body.ids)
            ? Array.from(new Set(body.ids.filter((id: unknown) => typeof id === 'string' && id !== session.user.id)))
            : [];

        if (ids.length === 0) {
            return NextResponse.json({ error: 'Select at least one user other than your own account' }, { status: 400 });
        }

        const result = await prisma.user.deleteMany({
            where: {
                id: { in: ids },
            },
        });

        return NextResponse.json({ message: 'Users deleted', count: result.count });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
