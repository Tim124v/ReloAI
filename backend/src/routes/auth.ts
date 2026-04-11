import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { sendWelcomeEmail } from '../services/email.service';

const FREE_LIMIT = 3;

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', async (request, reply) => {
    try {
      const parsed = registerSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: parsed.error.issues,
        });
      }

      const { email, password, name } = parsed.data;
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return reply.code(409).send({
          error: 'Email already registered',
          code: 'EMAIL_ALREADY_REGISTERED',
        });
      }

      const hashed = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({ data: { email, password: hashed, name } });
      sendWelcomeEmail(email).catch(console.error);
      console.info('[auth] new user registered', { userId: user.id, email: user.email });

      const token = fastify.jwt.sign({ userId: user.id, email: user.email }, { expiresIn: '7d' });
      return {
        token,
        user: { id: user.id, email: user.email, name: user.name, plan: user.plan, monthlyUsage: user.monthlyUsage },
      };
    } catch (error) {
      console.error('[auth] register failed', error);
      return reply.code(500).send({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  });

  fastify.post('/login', async (request, reply) => {
    try {
      const parsed = loginSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: parsed.error.issues,
        });
      }

      const { email, password } = parsed.data;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return reply.code(401).send({ error: 'Invalid email or password', code: 'UNAUTHORIZED' });
      }

      const token = fastify.jwt.sign({ userId: user.id, email: user.email }, { expiresIn: '7d' });
      return {
        token,
        user: { id: user.id, email: user.email, name: user.name, plan: user.plan, monthlyUsage: user.monthlyUsage },
      };
    } catch (error) {
      console.error('[auth] login failed', error);
      return reply.code(500).send({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  });

  fastify.get('/me', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const userId = request.user.userId ?? request.user.id;
      if (!userId) return reply.code(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
          monthlyUsage: true,
          subscriptionStatus: true,
          createdAt: true,
        },
      });
      if (!user) return reply.code(404).send({ error: 'Not found', code: 'NOT_FOUND' });

      return {
        ...user,
        freeLimit: FREE_LIMIT,
        remaining: user.plan === 'free' ? Math.max(0, FREE_LIMIT - user.monthlyUsage) : null,
      };
    } catch (error) {
      console.error('[auth] me failed', error);
      return reply.code(500).send({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  });
}
