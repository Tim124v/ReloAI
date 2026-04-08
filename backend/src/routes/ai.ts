import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import OpenAI from 'openai';

const FREE_LIMIT = 3;

function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured. Add it in the Secrets tab.');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

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
  fastify.post('/relocate', { preHandler: authenticate }, async (request, reply) => {
    const user = request.currentUser;

    const parsed = relocateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.issues[0].message });
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

    // Enforce limit before calling OpenAI
    if (user.plan === 'FREE' && user.monthlyUsage >= FREE_LIMIT) {
      return reply.code(403).send({
        error: 'FREE_LIMIT_REACHED',
        message: `Free plan allows ${FREE_LIMIT} analyses/month. Upgrade to Pro for unlimited access.`,
      });
    }

    const { profession, budget, language, goals } = parsed.data;

    const systemPrompt = `You are a world-class international relocation advisor with expertise in visas, taxes, cost of living, and expat communities. Based on the user's profile, recommend the 5 best countries for relocation. You MUST respond with valid JSON only — no markdown, no explanation, no text outside the JSON object.`;

    const userPrompt = `Analyze and recommend the 5 best countries for relocation for this profile:
- Profession: ${profession}
- Monthly budget: ${budget}
- Preferred working language: ${language}
- Goals: ${goals}

Respond with EXACTLY this JSON structure (no other text):
{
  "summary": "2-3 sentence personalized relocation strategy",
  "countries": [
    {
      "name": "Country Name",
      "flag": "🇵🇹",
      "score": 92,
      "reasons": ["Specific reason 1", "Specific reason 2", "Specific reason 3"],
      "visa": "Visa type: requirements and timeline",
      "cost": "$X,XXX–$X,XXX/month",
      "pros": ["Pro 1", "Pro 2"],
      "cons": ["Con 1", "Con 2"]
    }
  ],
  "plan": [
    "Month 1: Research specific action",
    "Month 2: Document preparation",
    "Month 3: Visa application",
    "Month 4–6: Transition planning",
    "Month 6–12: Move and settle"
  ],
  "checklist": [
    "Obtain apostille on birth certificate",
    "Open international bank account",
    "Get criminal background check",
    "Research health insurance options",
    "Join expat communities in target country"
  ]
}

Tailor everything to the profession and goals. Be specific, not generic. Score from 0-100.`;

    try {
      const openai = getOpenAI();

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 2500,
        temperature: 0.7,
      });

      const rawText = completion.choices[0].message.content || '{}';

      let result: RelocationResult;
      try {
        result = JSON.parse(rawText);
      } catch {
        return reply.code(500).send({ error: 'AI returned malformed JSON. Try again.' });
      }

      if (!result.countries || !Array.isArray(result.countries) || result.countries.length === 0) {
        return reply.code(500).send({ error: 'AI returned incomplete data. Try again.' });
      }

      const record = await prisma.relocationRequest.create({
        data: {
          userId: user.id,
          profession,
          budget,
          input: JSON.stringify({ profession, budget, language, goals }),
          result: JSON.stringify(result),
          tokens: completion.usage?.total_tokens ?? 0,
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { monthlyUsage: { increment: 1 } },
      });

      return {
        result,
        requestId: record.id,
        tokens: completion.usage?.total_tokens ?? 0,
      };
    } catch (err: unknown) {
      const apiErr = err as { status?: number; message?: string };
      if (apiErr.status === 401) {
        return reply.code(500).send({ error: 'OpenAI API key is invalid. Check your secrets.' });
      }
      return reply.code(500).send({ error: apiErr.message || 'AI generation failed' });
    }
  });

  fastify.get('/history', { preHandler: authenticate }, async (request) => {
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
  });

  fastify.get('/history/:id', { preHandler: authenticate }, async (request, reply) => {
    const user = request.currentUser;
    const { id } = request.params as { id: string };
    const record = await prisma.relocationRequest.findFirst({ where: { id, userId: user.id } });
    if (!record) return reply.code(404).send({ error: 'Not found' });

    let result: RelocationResult | null = null;
    let input: { profession: string; budget: string; language: string; goals: string } | null = null;
    try {
      result = JSON.parse(record.result);
      input = JSON.parse(record.input);
    } catch {
      return reply.code(500).send({ error: 'Corrupted record' });
    }

    return { id: record.id, input, result, createdAt: record.createdAt, tokens: record.tokens };
  });
}
