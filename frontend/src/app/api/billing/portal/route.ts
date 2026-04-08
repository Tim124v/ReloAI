import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireAuth } from '@/lib/server/auth';

export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!user.stripeCustomerId) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${frontendUrl}/dashboard/billing`,
  });

  return NextResponse.json({ url: session.url });
}
