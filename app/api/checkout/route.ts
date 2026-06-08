
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const POST = auth(async function POST(req: any) {
    try {
        const session = req.auth;
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { tripId, seats } = await req.json();

        if (!tripId || !seats || !Array.isArray(seats)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Fetch trip details and validate
        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            include: { bus: true, route: true },
        });

        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        // 2. Create line items for Stripe
        const lineItems = seats.map((seat: any) => {
            // Handle both object {number: "A1"} and string "A1"
            const seatNumber = typeof seat === 'string' ? seat : seat.number;

            return {
                price_data: {
                    currency: 'lkr',
                    product_data: {
                        name: `Seat ${seatNumber} - ${trip.route.name}`,
                        description: `Trip from ${trip.route.origin} to ${trip.route.destination} on ${trip.departureTime.toLocaleDateString()}`,
                    },
                    unit_amount: Math.round(trip.basePrice * 100),
                },
                quantity: 1,
            };
        });

        // 3. Create Stripe Checkout Session
        // Use request origin as fallback for NEXTAUTH_URL
        const baseUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin;

        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${baseUrl}/bookings/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/book/${tripId}`,
            metadata: {
                tripId,
                userId: session.user.id,
                seats: JSON.stringify(seats),
            },
        });

        return NextResponse.json({ url: stripeSession.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        // If it's a Stripe error, return the specific message to help debugging
        const message = error.raw?.message || error.message || 'Payment initiation failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
})
