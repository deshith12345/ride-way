
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createPaidBooking } from '@/lib/booking';
import { getCardBrand, isValidExpiry, isValidLuhn } from '@/lib/payments';

export const POST = auth(async function POST(req: any) {
    try {
        const session = req.auth;
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { tripId, seats, payment } = await req.json();

        if (!tripId || !seats || !Array.isArray(seats)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!payment?.cardNumber || !payment?.expiry || !payment?.cvv || !payment?.cardholderName) {
            return NextResponse.json({ error: 'Enter complete card details' }, { status: 400 });
        }

        const brand = getCardBrand(payment.cardNumber);

        if (!brand) {
            return NextResponse.json({ error: 'Only Visa and Mastercard are supported' }, { status: 400 });
        }

        if (!isValidLuhn(payment.cardNumber) || !isValidExpiry(payment.expiry) || !/^\d{3,4}$/.test(payment.cvv)) {
            return NextResponse.json({ error: 'Card details are invalid' }, { status: 400 });
        }

        const booking = await createPaidBooking({
            tripId,
            userId: session.user.id,
            seats,
            paymentMethod: brand,
            paymentReference: `${brand}-${Date.now()}-${crypto.randomUUID()}`,
        });

        return NextResponse.json({ bookingId: booking.id, booking });
    } catch (error: any) {
        console.error('Checkout Error:', error);
        const message = error.message || 'Payment failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
})
