import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const [userCount, routeCount] = await Promise.all([
            prisma.user.count({ where: { role: 'TRAVELLER' } }),
            prisma.route.count()
        ]);

        return NextResponse.json({
            travelers: userCount + 50000, // baseline + actual
            routes: routeCount,
            rating: "4.9"
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
