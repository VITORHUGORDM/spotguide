import { FastifyReply, FastifyRequest } from 'fastify';
import { CategoriesService } from './categories.service.js';

export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const categories = await this.categoriesService.listAll();
    return reply.status(200).send(categories);
  }
}
