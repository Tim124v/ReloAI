import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { checkUsageLimit, LIMITS, saveRequest } from '../services/usage.service';
import { runAIAnalysis } from '../services/ai/ai.service';

const FREE_LIMIT = 3;

const relocateSchema = z.object({
  profession: z.string().min(1, 'Profession is required').max(200),
  budget: z.string().min(1, 'Budget is required').max(100),
  language: z.string().max(50).optional().default('English'),
  goals: z.string().min(1, 'Goals are required').max(1000),
});

export interface RelocationResult {
  countries: Array<{
    name: string;
    flag: string;
    score: number;
    reasons: string[];
    visa: string;
    cost: string;
    pros: string[];
    cons: string[];
  }>;
  plan: string[];
  checklist: string[];
  summary: string;
}

export async function aiRoutes(fastify: FastifyInstance) {
  fastify.post('/relocate', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const user = request.currentUser;
      const parsed = relocateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: parsed.error.issues,
        });
      }

      // Reset monthly usage if new calendar month
      const now = new Date();
      const resetAt = new Date(user.usageResetAt);
      if (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
        await prisma.user.update({
          where: { id: user.id },
          data: { monthlyUsage: 0, usageResetAt: now },
        });
        user.monthlyUsage = 0;
      }

      // Enforce legacy monthly limit before calling OpenAI
      if (user.plan === 'free' && user.monthlyUsage >= FREE_LIMIT) {
        console.info('[ai] limit exceeded', { userId: user.id, plan: user.plan, type: 'monthly' });
        return reply.code(429).send({
          error: `Free plan allows ${FREE_LIMIT} analyses/month. Upgrade to Pro for unlimited access.`,
          code: 'FREE_LIMIT_REACHED',
        });
      }

      const { profession, budget, language, goals } = parsed.data;
      const userId = request.user.userId ?? request.user.id ?? user.id;
      const planFromJwt = (request.user as { plan?: string }).plan;
      const plan = (planFromJwt ?? user.plan ?? 'free').toLowerCase();

      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      }

      try {
        await checkUsageLimit(userId, plan);
      } catch (error) {
        console.info('[ai] limit exceeded', { userId, plan, type: 'request-count' });
        const message = error instanceof Error ? error.message : 'Usage limit reached';
        return reply.code(429).send({ error: message, code: 'USAGE_LIMIT_REACHED' });
      }

      const input = { profession, budget, language, goals };
      const aiResponse = await runAIAnalysis('country', input) as { result: object; tokens: number };
      const result = aiResponse.result as RelocationResult;

      if (!result.countries || !Array.isArray(result.countries) || result.countries.length === 0) {
        return reply.code(500).send({ error: 'Internal server error', code: 'AI_INCOMPLETE_RESPONSE' });
      }

      const record = await prisma.relocationRequest.create({
        data: {
          userId: user.id,
          profession,
          budget,
          input: JSON.stringify(input),
          result: JSON.stringify(result),
          tokens: aiResponse.tokens ?? 0,
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { monthlyUsage: { increment: 1 } },
      });

      await saveRequest({
        userId,
        mode: 'country',
        input,
        output: result as unknown as object,
      });

      const usageCount = await prisma.request.count({ where: { userId } });
      const usageLimit = LIMITS[plan as keyof typeof LIMITS] ?? LIMITS.free;
      console.info('[ai] analysis completed', { userId, mode: 'country', usageCount, usageLimit });

      return {
        result,
        requestId: record.id,
        tokens: aiResponse.tokens ?? 0,
        usageCount,
        usageLimit,
      };
    } catch (err: unknown) {
      console.error('[ai] relocate failed', err);
      const apiErr = err as { status?: number; message?: string };
      if (apiErr.message === 'Invalid AI response format') {
        return reply.code(500).send({ error: 'Internal server error', code: 'INVALID_AI_RESPONSE' });
      }
      if (apiErr.message === 'AI service timeout') {
        return reply.code(500).send({ error: 'Internal server error', code: 'AI_TIMEOUT' });
      }
      if (apiErr.status === 401) {
        return reply.code(500).send({ error: 'Internal server error', code: 'AI_AUTH_ERROR' });
      }
      return reply.code(500).send({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  });

  fastify.get('/history', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const user = request.currentUser;
      const records = await prisma.relocationRequest.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: { id: true, profession: true, budget: true, createdAt: true, tokens: true },
      });
      return {
        history: records.map((r) => ({
          id: r.id,
          profession: r.profession,
          budget: r.budget,
          createdAt: r.createdAt,
          tokens: r.tokens,
        })),
      };
    } catch (error) {
      console.error('[ai] history failed', error);
      return reply.code(500).send({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  });

  fastify.get('/history/:id', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const user = request.currentUser;
      const { id } = request.params as { id: string };
      const record = await prisma.relocationRequest.findFirst({ where: { id, userId: user.id } });
      if (!record) return reply.code(404).send({ error: 'Not found', code: 'NOT_FOUND' });

      let result: RelocationResult | null = null;
      let input: { profession: string; budget: string; language: string; goals: string } | null = null;
      try {
        result = JSON.parse(record.result);
        input = JSON.parse(record.input);
      } catch {
        return reply.code(500).send({ error: 'Internal server error', code: 'CORRUPTED_RECORD' });
      }

      return { id: record.id, input, result, createdAt: record.createdAt, tokens: record.tokens };
    } catch (error) {
      console.error('[ai] history by id failed', error);
      return reply.code(500).send({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  });
}
