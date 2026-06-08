import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';

export const stripe = new Stripe(stripeKey, {
    apiVersion: '2026-01-28.clover',
    typescript: true,
});
