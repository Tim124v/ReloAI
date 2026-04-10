import { FastifyInstance } from 'fastify';
import Stripe from 'stripe';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const PRICE_ID = process.env.STRIPE_PRICE_ID || '';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const emptyBodySchema = z.object({}).passthrough();
const webhookBodySchema = z.unknown();

export async function billingRoutes(fastify: FastifyInstance) {
  fastify.post('/create-checkout', { preHandler: authenticate }, async (request, reply) => {
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

      if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
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
    } catch (error) {
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
