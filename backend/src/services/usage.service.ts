import { prisma } from '../lib/prisma';

export const LIMITS = {
  free: 10,
  pro: Infinity,
};

export async function checkUsageLimit(userId: string, plan: string): Promise<void> {
  const count = await prisma.request.count({ where: { userId } });
  const limit = LIMITS[plan as keyof typeof LIMITS] ?? LIMITS.free;
  if (count >= limit) {
    throw new Error('Usage limit reached. Upgrade to Pro for unlimited analyses.');
  }
}

export async function saveRequest(data: {
  userId: string;
  mode: string;
  input: object;
  output: object;
}) {
  return prisma.request.create({ data });
}
