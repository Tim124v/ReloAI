import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';

const FREE_LIMIT = 3;

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    monthlyUsage: user.monthlyUsage,
    subscriptionStatus: user.subscriptionStatus,
    freeLimit: FREE_LIMIT,
    remaining: user.plan === 'FREE' ? Math.max(0, FREE_LIMIT - user.monthlyUsage) : null,
  });
}
