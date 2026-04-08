import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { requireAuth } from '@/lib/server/auth';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } | null }
) {
  const { user, error } = await requireAuth(request);
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = context?.params?.id;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const record = await prisma.relocationRequest.findFirst({
    where: { id, userId: user.id },
  });
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const result = JSON.parse(record.result);
    const input = JSON.parse(record.input);
    return NextResponse.json({ id: record.id, input, result, createdAt: record.createdAt, tokens: record.tokens });
  } catch {
    return NextResponse.json({ error: 'Corrupted record' }, { status: 500 });
  }
}
