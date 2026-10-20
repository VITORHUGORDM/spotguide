import { FastifyReply, FastifyRequest } from 'fastify';
import { CategoriesService } from './categories.service.js';
import { cacheControl } from '../../shared/http/cache-control.js';

export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const categories = await this.categoriesService.listAll();
    cacheControl(reply, { sMaxAge: 3600, staleWhileRevalidate: 86400 });
    return reply.status(200).send(categories);
  }
}
