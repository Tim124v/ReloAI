import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/server/prisma';
import { requireAuth } from '@/lib/server/auth';

export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to environment.' }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const PRICE_ID = process.env.STRIPE_PRICE_ID || '';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    mode: 'subscription',
    success_url: `${frontendUrl}/dashboard/billing?success=true`,
    cancel_url: `${frontendUrl}/dashboard/billing?canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}
