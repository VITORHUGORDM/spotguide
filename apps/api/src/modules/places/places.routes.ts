import { FastifyInstance } from 'fastify';
import { PlacesRepository } from './places.repository.js';
import { PlacesService } from './places.service.js';
import { PlacesController } from './places.controller.js';
import { authGuard } from '../../shared/middlewares/auth.guard.js';
import { roleGuard } from '../../shared/middlewares/role.guard.js';
import { placeOwnershipGuard } from '../../shared/middlewares/idor.guard.js';

export async function placesRoutes(app: FastifyInstance) {
  const placesRepository = new PlacesRepository();
  const placesService = new PlacesService(placesRepository);
  const placesController = new PlacesController(placesService);

  // Rotas Públicas (Viajantes e Visitantes)
  app.get('/', placesController.search.bind(placesController));
  app.get('/slug/:slug', placesController.getBySlug.bind(placesController));

  // Rota de Estabelecimentos do Comerciante Autenticado (Registrada antes de rotas com :id)
  app.get(
    '/merchant/my-places',
    {
      preHandler: [authGuard, roleGuard(['MERCHANT', 'ADMIN'])],
    },
    placesController.getMyPlaces.bind(placesController)
  );

  // Rota de autocomplete de cidades
  app.get('/cities', placesController.getCities.bind(placesController));

  app.get('/id/:id', placesController.getById.bind(placesController));

  // Rotas Protegidas - Apenas Comerciantes e Administradores
  app.post(
    '/',
    {
      preHandler: [authGuard, roleGuard(['MERCHANT', 'ADMIN'])],
    },
    placesController.create.bind(placesController)
  );

  // Rota Protegida com Proteção contra IDOR (Verifica se o usuário é o dono real do estabelecimento)
  app.put(
    '/:id',
    {
      preHandler: [authGuard, roleGuard(['MERCHANT', 'ADMIN']), placeOwnershipGuard],
    },
    placesController.update.bind(placesController)
  );

  app.delete(
    '/:id',
    {
      preHandler: [authGuard, roleGuard(['MERCHANT', 'ADMIN']), placeOwnershipGuard],
    },
    placesController.delete.bind(placesController)
  );
}
