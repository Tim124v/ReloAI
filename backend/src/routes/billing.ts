import { FastifyInstance } from 'fastify';
import Stripe from 'stripe';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const getStripeClient = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_NOT_CONFIGURED');
  return new Stripe(key, { apiVersion: '2023-10-16' });
};

const PRICE_ID = process.env.STRIPE_PRICE_ID || '';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const checkoutBodySchema = z.object({ returnUrl: z.string().url().optional() }).passthrough();
const emptyBodySchema = z.object({}).passthrough();
const webhookBodySchema = z.unknown();

export async function billingRoutes(fastify: FastifyInstance) {
  fastify.post('/create-checkout', { preHandler: authenticate }, async (request, reply) => {
    try {
      const parsed = checkoutBodySchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: parsed.error.issues,
        });
      }

      const user = request.currentUser;
      const stripe = getStripeClient();
      if (process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
        return reply.code(503).send({
          error: 'Payment system is not configured yet.',
          code: 'STRIPE_NOT_CONFIGURED',
        });
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

      const frontendUrl = parsed.data.returnUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
      const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = PRICE_ID
        ? { price: PRICE_ID, quantity: 1 }
        : {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'ReloAI Pro',
                description: 'Unlimited AI analyses per month',
              },
              unit_amount: 900,
              recurring: { interval: 'month' },
            },
            quantity: 1,
          };

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [lineItem],
        mode: 'subscription',
        success_url: `${frontendUrl}/dashboard?upgrade=success`,
        cancel_url: `${frontendUrl}/dashboard?upgrade=cancelled`,
        metadata: { userId: user.id },
      });

      return { url: session.url };
    } catch (error) {
      if (error instanceof Error && error.message === 'STRIPE_NOT_CONFIGURED') {
        return reply.code(503).send({
          error: 'Payment system is not configured yet.',
          code: 'STRIPE_NOT_CONFIGURED',
        });
      }
      console.error('[billing] create-checkout failed', error);
      return reply.code(500).send({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  });

  fastify.post('/portal', { preHandler: authenticate }, async (request, reply) => {
    try {
      const parsed = emptyBodySchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: parsed.error.issues,
        });
      }

      const user = request.currentUser;
      const stripe = getStripeClient();
      if (!user.stripeCustomerId) return reply.code(400).send({ error: 'No billing account found', code: 'NO_BILLING' });

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/billing`,
      });

      return { url: session.url };
    } catch (error) {
      console.error('[billing] portal failed', error);
      return reply.code(500).send({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  });

  fastify.post('/webhook', async (request, reply) => {
    try {
      const parsed = webhookBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: parsed.error.issues,
        });
      }

      const sig = request.headers['stripe-signature'] as string;
      if (!sig || !WEBHOOK_SECRET) return reply.code(400).send({ error: 'Missing signature', code: 'INVALID_WEBHOOK' });
      const stripe = getStripeClient();

      let event: Stripe.Event;
      try {
        const rawBody = request.rawBody ?? JSON.stringify(request.body);
        event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
      } catch {
        return reply.code(400).send({ error: 'Invalid webhook signature', code: 'INVALID_WEBHOOK' });
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
              plan: sub.status === 'active' ? 'pro' : 'free',
            },
          });
          break;
        }
        case 'customer.subscription.deleted': {
          const sub = event.data.object as Stripe.Subscription;
          await prisma.user.updateMany({
            where: { stripeCustomerId: sub.customer as string },
            data: { plan: 'free', stripeSubscriptionId: null, subscriptionStatus: 'canceled' },
          });
          break;
        }
      }

      return { received: true };
    } catch (error) {
      console.error('[billing] webhook failed', error);
      return reply.code(500).send({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  });
}
