import { FastifyReply, FastifyRequest } from 'fastify';
import { CreatePlaceInputSchema, UpdatePlaceInputSchema, SearchPlacesQuerySchema } from '@guia/contracts';
import { PlacesService } from './places.service.js';

export class PlacesController {
  constructor(private placesService: PlacesService) {}

  async search(request: FastifyRequest, reply: FastifyReply) {
    const query = SearchPlacesQuerySchema.parse(request.query);
    const places = await this.placesService.search(query);
    return reply.status(200).send(places);
  }

  async getBySlug(request: FastifyRequest, reply: FastifyReply) {
    const { slug } = request.params as { slug: string };
    const place = await this.placesService.getBySlug(slug);
    return reply.status(200).send(place);
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const place = await this.placesService.getById(id);
    return reply.status(200).send(place);
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    // Validação estrita via Zod (Anti-Mass Assignment)
    const body = CreatePlaceInputSchema.parse(request.body);
    const ownerId = request.user.sub;

    const place = await this.placesService.create(body, ownerId);
    return reply.status(201).send(place);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = UpdatePlaceInputSchema.parse(request.body);

    const updated = await this.placesService.update(id, body);
    return reply.status(200).send(updated);
  }

  async getMyPlaces(request: FastifyRequest, reply: FastifyReply) {
    const ownerId = request.user.sub;
    const places = await this.placesService.findByOwnerId(ownerId);
    return reply.status(200).send(places);
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await this.placesService.delete(id);
    return reply.status(204).send();
  }

  async getCities(request: FastifyRequest, reply: FastifyReply) {
    const { q } = request.query as { q?: string };
    const cities = await this.placesService.getCities(q);
    return reply.status(200).send(cities);
  }
}
