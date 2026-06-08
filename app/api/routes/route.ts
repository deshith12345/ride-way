import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const routes = await prisma.route.findMany({
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(routes);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
