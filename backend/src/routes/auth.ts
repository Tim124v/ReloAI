import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const FREE_LIMIT = 3;

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message });

    const { email, password, name } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return reply.code(409).send({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, password: hashed, name } });

    const token = fastify.jwt.sign({ id: user.id }, { expiresIn: '7d' });
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan, monthlyUsage: user.monthlyUsage },
    };
  });

  fastify.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message });

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return reply.code(401).send({ error: 'Invalid email or password' });
    }

    const token = fastify.jwt.sign({ id: user.id }, { expiresIn: '7d' });
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan, monthlyUsage: user.monthlyUsage },
    };
  });

  fastify.get('/me', {
    preHandler: async (req, reply) => {
      try { await req.jwtVerify(); } catch { return reply.code(401).send({ error: 'Unauthorized' }); }
    },
  }, async (request, reply) => {
    const { id } = request.user as { id: string };
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, plan: true, monthlyUsage: true, subscriptionStatus: true },
    });
    if (!user) return reply.code(404).send({ error: 'Not found' });
    return {
      ...user,
      freeLimit: FREE_LIMIT,
      remaining: user.plan === 'FREE' ? Math.max(0, FREE_LIMIT - user.monthlyUsage) : null,
    };
  });
}
