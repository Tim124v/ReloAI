import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    const userId = request.user.userId ?? request.user.id;
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return reply.code(401).send({ error: 'Unauthorized' });
    request.currentUser = user;
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
}

// Backward-compatible alias for existing routes.
export const authenticate = requireAuth;
