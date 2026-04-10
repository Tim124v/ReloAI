import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rawBody from 'fastify-raw-body';
import { authRoutes } from './routes/auth';
import { aiRoutes } from './routes/ai';
import { billingRoutes } from './routes/billing';

const app = Fastify({ logger: { level: 'warn' } });
let setupPromise: Promise<void> | null = null;

async function setupApp() {
  if (setupPromise) {
    return setupPromise;
  }

  setupPromise = (async () => {
  await app.register(rawBody, { runFirst: true });

  await app.register(cors, {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5000',
      'http://localhost:5000',
      'http://localhost:5001',
      'http://127.0.0.1:5001',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('FATAL: JWT_SECRET environment variable is not set.');
    process.exit(1);
  }
  await app.register(jwt, { secret: jwtSecret });

  // Phase 1: Auth backbone
  await app.register(authRoutes, { prefix: '/api/auth' });

  // Phase 3: AI core — structured JSON, not text
  await app.register(aiRoutes, { prefix: '/api/ai' });

  // Phase 7: Stripe billing
  await app.register(billingRoutes, { prefix: '/api/billing' });

  app.get('/health', async (_request, reply) => {
    try {
      return { status: 'ok', timestamp: new Date().toISOString() };
    } catch (error) {
      console.error('[health] failed', error);
      return reply.code(500).send({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  });
  })();

  return setupPromise;
}

async function main() {
  await setupApp();

  if (process.env.VERCEL !== '1') {
    const port = parseInt(process.env.PORT || '8080');
    await app.listen({ port, host: '0.0.0.0' });
    console.info(`\n✅ Backend running on http://localhost:${port}\n`);
  }
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Vercel serverless export
export default async function handler(req: any, res: any) {
  await setupApp();
  await app.ready();
  app.server.emit('request', req, res);
}
