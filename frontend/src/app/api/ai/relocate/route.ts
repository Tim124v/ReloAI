import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import { prisma } from '@/lib/server/prisma';
import { requireAuth } from '@/lib/server/auth';

const FREE_LIMIT = 3;

const schema = z.object({
  type: z.enum(['country', 'plan']).default('country'),
  profession: z.string().min(1).max(200),
  budget: z.string().min(1).max(100),
  language: z.string().max(50).optional().default('English'),
  goals: z.string().max(1000).optional().default(''),
  destination: z.string().max(200).optional().default(''),
});

export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const now = new Date();
  const resetAt = new Date(user.usageResetAt);
  if (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
    await prisma.user.update({
      where: { id: user.id },
      data: { monthlyUsage: 0, usageResetAt: now },
    });
    user.monthlyUsage = 0;
  }

  if (user.plan === 'FREE' && user.monthlyUsage >= FREE_LIMIT) {
    return NextResponse.json({
      error: 'FREE_LIMIT_REACHED',
      message: `Free plan allows ${FREE_LIMIT} analyses/month. Upgrade to Pro for unlimited access.`,
    }, { status: 403 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not configured.' }, { status: 500 });
  }

  const { type, profession, budget, language, goals, destination } = parsed.data;

  let systemPrompt: string;
  let userPrompt: string;

  if (type === 'plan') {
    if (!destination?.trim()) {
      return NextResponse.json({ error: 'Destination country is required for Relocation Plan' }, { status: 400 });
    }

    systemPrompt = `You are a world-class international relocation advisor. Create a detailed, actionable relocation plan for someone moving to a specific country. You MUST respond with valid JSON only — no markdown, no explanation, no text outside the JSON object.`;

    userPrompt = `Create a detailed relocation plan for this profile moving to ${destination}:
- Profession: ${profession}
- Monthly budget: ${budget}
- Working language: ${language}

Respond with EXACTLY this JSON structure (no other text):
{
  "destination": "${destination}",
  "summary": "2-3 sentence overview of relocating to ${destination} for this profile",
  "phases": [
    {
      "phase": "Phase 1: Research & Preparation",
      "duration": "Months 1-2",
      "tasks": [
        "Research visa options for ${destination}",
        "Join expat communities online",
        "Start language learning if needed"
      ]
    },
    {
      "phase": "Phase 2: Documentation",
      "duration": "Months 2-4",
      "tasks": [
        "Gather required documents",
        "Apostille on key certificates",
        "Apply for visa"
      ]
    },
    {
      "phase": "Phase 3: Logistics",
      "duration": "Months 4-5",
      "tasks": [
        "Find housing remotely",
        "Arrange international health insurance",
        "Notify banks of move"
      ]
    },
    {
      "phase": "Phase 4: The Move",
      "duration": "Month 6",
      "tasks": [
        "Ship belongings or sell what you don't need",
        "Book flights",
        "Set up temporary accommodation"
      ]
    },
    {
      "phase": "Phase 5: Settling In",
      "duration": "Months 6-12",
      "tasks": [
        "Register with local authorities",
        "Open local bank account",
        "Find long-term housing"
      ]
    }
  ],
  "requirements": [
    "Passport valid 6+ months",
    "Proof of income or employment",
    "Criminal background check",
    "Health insurance coverage"
  ],
  "costs": {
    "visa": "Visa fee and processing cost",
    "monthly": "Estimated monthly cost of living",
    "oneTime": "One-time moving and setup costs"
  },
  "tips": [
    "Practical tip specific to ${destination}",
    "Tax or legal consideration",
    "Cultural integration tip"
  ]
}

Be specific to ${destination} and the profession. All tasks and tips should be actionable and tailored.`;
  } else {
    systemPrompt = `You are a world-class international relocation advisor with expertise in visas, taxes, cost of living, and expat communities. Based on the user's profile, recommend the 5 best countries for relocation. You MUST respond with valid JSON only — no markdown, no explanation, no text outside the JSON object.`;

    userPrompt = `Analyze and recommend the 5 best countries for relocation for this profile:
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
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
    let result;
    try {
      result = JSON.parse(rawText);
    } catch {
      return NextResponse.json({ error: 'AI returned malformed JSON. Try again.' }, { status: 500 });
    }

    if (type === 'country' && (!result.countries || !Array.isArray(result.countries) || result.countries.length === 0)) {
      return NextResponse.json({ error: 'AI returned incomplete data. Try again.' }, { status: 500 });
    }
    if (type === 'plan' && (!result.phases || !Array.isArray(result.phases))) {
      return NextResponse.json({ error: 'AI returned incomplete plan data. Try again.' }, { status: 500 });
    }

    const record = await prisma.relocationRequest.create({
      data: {
        userId: user.id,
        profession,
        budget,
        input: JSON.stringify({ type, profession, budget, language, goals, destination }),
        result: JSON.stringify(result),
        tokens: completion.usage?.total_tokens ?? 0,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { monthlyUsage: { increment: 1 } },
    });

    return NextResponse.json({
      type,
      result,
      requestId: record.id,
      tokens: completion.usage?.total_tokens ?? 0,
    });
  } catch (err: unknown) {
    const apiErr = err as { status?: number; message?: string };
    if (apiErr.status === 401) {
      return NextResponse.json({ error: 'OpenAI API key is invalid.' }, { status: 500 });
    }
    return NextResponse.json({ error: apiErr.message || 'AI generation failed' }, { status: 500 });
  }
}
