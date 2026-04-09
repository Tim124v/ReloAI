import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/server/prisma';
import { signToken } from '@/lib/server/auth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { email, password, name } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, password: hashed, name } });
    const token = signToken({ id: user.id });

    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan, monthlyUsage: user.monthlyUsage },
    });
  } catch (err: unknown) {
    const e = err as { message?: string; code?: string };
    console.error('[register] error:', e?.message, e?.code);
    return NextResponse.json({ error: 'Server error', detail: e?.message }, { status: 500 });
  }
}
