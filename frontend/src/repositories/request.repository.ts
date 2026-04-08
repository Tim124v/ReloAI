import { prisma } from '@/lib/server/prisma';
import { AnalysisMode } from '@/services/ai.service';

export interface SaveRequestData {
  userId: string;
  mode: AnalysisMode;
  profession?: string;
  budget?: string;
  input: Record<string, string>;
  result: unknown;
  tokens: number;
}

export async function saveRequest(data: SaveRequestData) {
  return prisma.relocationRequest.create({
    data: {
      userId: data.userId,
      profession: data.profession || data.input.profession || '',
      budget: data.budget || data.input.budget || '',
      input: JSON.stringify({ mode: data.mode, ...data.input }),
      result: JSON.stringify(data.result),
      tokens: data.tokens,
    },
  });
}

export async function getUserHistory(userId: string) {
  return prisma.relocationRequest.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, profession: true, budget: true, createdAt: true, tokens: true, input: true },
  });
}

export async function getRequestById(id: string, userId: string) {
  return prisma.relocationRequest.findFirst({
    where: { id, userId },
  });
}

export async function incrementUserUsage(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { monthlyUsage: { increment: 1 } },
  });
}

export async function resetUserUsageIfNeeded(userId: string, currentUsage: number, resetAt: Date): Promise<number> {
  const now = new Date();
  if (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
    await prisma.user.update({
      where: { id: userId },
      data: { monthlyUsage: 0, usageResetAt: now },
    });
    return 0;
  }
  return currentUsage;
}
