import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { requireAuth } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const records = await prisma.relocationRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { id: true, profession: true, budget: true, createdAt: true, tokens: true },
  });

  return NextResponse.json({
    history: records.map((r) => ({
      id: r.id,
      profession: r.profession,
      budget: r.budget,
      createdAt: r.createdAt,
      tokens: r.tokens,
    })),
  });
}
