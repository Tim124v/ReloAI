import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/server/auth';
import { runAiAnalysis, AnalysisMode } from '@/services/ai.service';
import {
  saveRequest,
  incrementUserUsage,
  resetUserUsageIfNeeded,
} from '@/repositories/request.repository';

const FREE_LIMIT = 3;

const schema = z.object({
  mode: z.enum(['country', 'plan', 'visa', 'cost']).default('country'),
  profession: z.string().max(200).optional().default(''),
  budget: z.string().max(100).optional().default(''),
  language: z.string().max(50).optional().default('English'),
  goals: z.string().max(1000).optional().default(''),
  destination: z.string().max(200).optional().default(''),
  nationality: z.string().max(100).optional().default(''),
  lifestyle: z.string().max(50).optional().default('Comfortable'),
});

export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { mode, ...inputFields } = parsed.data;

  const currentUsage = await resetUserUsageIfNeeded(user.id, user.monthlyUsage, user.usageResetAt);
  if (user.plan === 'FREE' && currentUsage >= FREE_LIMIT) {
    return NextResponse.json(
      { error: 'FREE_LIMIT_REACHED', message: `Free plan: ${FREE_LIMIT} analyses/month. Upgrade to Pro.` },
      { status: 403 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not configured.' }, { status: 500 });
  }

  try {
    const { result, tokens } = await runAiAnalysis(
      mode as AnalysisMode,
      inputFields as Record<string, string>,
      process.env.OPENAI_API_KEY,
    );

    const record = await saveRequest({
      userId: user.id,
      mode: mode as AnalysisMode,
      profession: inputFields.profession,
      budget: inputFields.budget,
      input: { mode, ...inputFields } as Record<string, string>,
      result,
      tokens,
    });

    await incrementUserUsage(user.id);

    return NextResponse.json({ mode, result, requestId: record.id, tokens });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status === 401) {
      return NextResponse.json({ error: 'OpenAI API key is invalid.' }, { status: 500 });
    }
    return NextResponse.json({ error: e.message || 'AI generation failed' }, { status: 500 });
  }
}
