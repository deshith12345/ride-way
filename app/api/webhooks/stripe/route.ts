
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event: any;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
    }

    const session = event.data.object;

    if (event.type === 'checkout.session.completed') {
        const { tripId, userId, seats } = session.metadata;
        const parsedSeats = JSON.parse(seats);

        try {
            // Use transaction to ensure booking and tickets are created together
            await prisma.$transaction(async (tx) => {
                // 1. Create Booking
                const booking = await tx.booking.create({
                    data: {
                        tripId,
                        userId,
                        totalAmount: session.amount_total / 100, // Convert from cents
                        status: 'CONFIRMED',
                        paymentStatus: 'PAID',
                        payment: {
                            create: {
                                amount: session.amount_total / 100,
                                method: 'CARD',
                                stripePaymentId: session.payment_intent as string,
                                status: 'PAID',
                            },
                        },
                    },
                });

                // 2. Create Tickets for each seat
                await tx.ticket.createMany({
                    data: parsedSeats.map((seat: any) => ({
                        bookingId: booking.id,
                        seatNumber: seat.number,
                        passengerName: seat.name || 'Anonymous',
                        passengerGender: seat.gender ? seat.gender.toUpperCase() : null,
                        price: (session.amount_total / 100) / parsedSeats.length,
                        qrCode: `${booking.id}-${seat.number}-${Math.random().toString(36).substring(7)}`,
                        status: 'VALID',
                    })),
                });

                // Optional: Update Trip available seats or other logic here
            });
        } catch (error) {
            console.error('Booking Creation Error:', error);
            return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
