import { FastifyInstance } from 'fastify';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const PRICE_ID = process.env.STRIPE_PRICE_ID || '';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function billingRoutes(fastify: FastifyInstance) {
  fastify.post('/create-checkout', { preHandler: authenticate }, async (request, reply) => {
    const user = request.currentUser;

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      return reply.code(503).send({ error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to environment.' });
    }

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

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      mode: 'subscription',
      success_url: `${frontendUrl}/dashboard/billing?success=true`,
      cancel_url: `${frontendUrl}/dashboard/billing?canceled=true`,
    });

    return { url: session.url };
  });

  fastify.post('/portal', { preHandler: authenticate }, async (request, reply) => {
    const user = request.currentUser;
    if (!user.stripeCustomerId) return reply.code(400).send({ error: 'No billing account found' });

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/billing`,
    });

    return { url: session.url };
  });

  fastify.post('/webhook', async (request, reply) => {
    const sig = request.headers['stripe-signature'] as string;
    if (!sig || !WEBHOOK_SECRET) return reply.code(400).send({ error: 'Missing signature' });

    let event: Stripe.Event;
    try {
      const rawBody = request.rawBody ?? JSON.stringify(request.body);
      event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return reply.code(400).send({ error: `Webhook error: ${message}` });
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.user.updateMany({
          where: { stripeCustomerId: sub.customer as string },
          data: {
            stripeSubscriptionId: sub.id,
            subscriptionStatus: sub.status,
            plan: sub.status === 'active' ? 'PRO' : 'FREE',
          },
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.user.updateMany({
          where: { stripeCustomerId: sub.customer as string },
          data: { plan: 'FREE', stripeSubscriptionId: null, subscriptionStatus: 'canceled' },
        });
        break;
      }
    }

    return { received: true };
  });
}
