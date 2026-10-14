import { FastifyInstance } from 'fastify';
import { CategoriesService } from './categories.service.js';
import { CategoriesController } from './categories.controller.js';

export async function categoriesRoutes(app: FastifyInstance) {
  const categoriesService = new CategoriesService();
  const categoriesController = new CategoriesController(categoriesService);

  app.get('/', categoriesController.list.bind(categoriesController));
}
