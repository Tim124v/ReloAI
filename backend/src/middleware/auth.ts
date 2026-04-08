import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    const { id } = request.user as { id: string };
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return reply.code(401).send({ error: 'Unauthorized' });
    request.currentUser = user;
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
}
