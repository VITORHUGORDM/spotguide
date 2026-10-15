import { FastifyInstance } from 'fastify';
import { ReviewsService } from './reviews.service.js';
import { ReviewsController } from './reviews.controller.js';
import { authGuard } from '../../shared/middlewares/auth.guard.js';
import { roleGuard } from '../../shared/middlewares/role.guard.js';

export async function reviewsRoutes(app: FastifyInstance) {
  const reviewsService = new ReviewsService();
  const reviewsController = new ReviewsController(reviewsService);

  // Listagem pública das avaliações do estabelecimento
  app.get('/place/:placeId', reviewsController.listByPlace.bind(reviewsController));

  // Envio de nova avaliação (requer login + rate limit por usuário)
  app.post(
    '/place/:placeId',
    {
      preHandler: [authGuard],
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },
    },
    reviewsController.create.bind(reviewsController)
  );

  // Resposta do comerciante à avaliação
  app.post(
    '/:reviewId/reply',
    {
      preHandler: [authGuard, roleGuard(['MERCHANT', 'ADMIN'])],
    },
    reviewsController.reply.bind(reviewsController)
  );
}
