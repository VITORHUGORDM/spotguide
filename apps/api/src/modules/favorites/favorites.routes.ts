import { FastifyInstance } from 'fastify';
import { FavoriteParamsSchema } from '@guia/contracts';
import { FavoritesService } from './favorites.service.js';
import { authGuard } from '../../shared/middlewares/auth.guard.js';

export async function favoritesRoutes(app: FastifyInstance) {
  const service = new FavoritesService();
  const escrita = { preHandler: [authGuard], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } };

  // Lista privada: só o dono da conta vê os próprios favoritos
  app.get('/', { preHandler: [authGuard] }, async (request, reply) => {
    reply.header('Cache-Control', 'private, no-store');
    return service.list(request.user.sub);
  });

  app.put('/:placeId', escrita, async (request, reply) => {
    const { placeId } = FavoriteParamsSchema.parse(request.params);
    await service.add(request.user.sub, placeId);
    return reply.status(204).send();
  });

  app.delete('/:placeId', escrita, async (request, reply) => {
    const { placeId } = FavoriteParamsSchema.parse(request.params);
    await service.remove(request.user.sub, placeId);
    return reply.status(204).send();
  });
}
