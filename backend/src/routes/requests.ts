import { FastifyInstance } from 'fastify'
import { requireAuth } from '../middleware/auth'
import { prisma } from '../lib/prisma'

export async function requestRoutes(app: FastifyInstance) {
  // GET /api/requests — user's analysis history
  app.get('/', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string }

      const requests = await prisma.request.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true },
      })

      const usageCount = requests.length
      const usageLimit = user?.plan === 'pro' ? null : 3

      return reply.send({ requests, usageCount, usageLimit })
    } catch (error) {
      console.error('GET /api/requests error:', error)
      return reply.code(500).send({ error: 'Failed to fetch requests' })
    }
  })

  // GET /api/requests/:id — single analysis
  app.get('/:id', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string }
      const { id } = request.params as { id: string }

      const item = await prisma.request.findFirst({
        where: { id, userId },
      })

      if (!item) {
        return reply.code(404).send({ error: 'Not found' })
      }

      return reply.send(item)
    } catch (error) {
      console.error(`GET /api/requests/${request.params} error:`, error)
      return reply.code(500).send({ error: 'Failed to fetch request' })
    }
  })
}
