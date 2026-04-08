import { User } from '@prisma/client';
import 'fastify';
import '@fastify/jwt';

declare module 'fastify' {
  interface FastifyRequest {
    currentUser: User;
    rawBody?: Buffer | string;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: { id: string };
  }
}
