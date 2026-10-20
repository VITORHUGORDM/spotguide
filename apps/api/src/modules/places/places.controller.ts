import { FastifyReply, FastifyRequest } from 'fastify';
import { CreatePlaceInputSchema, UpdatePlaceInputSchema, SearchPlacesQuerySchema } from '@guia/contracts';
import { PlacesService } from './places.service.js';
import { buscaCidades, estadosComLugares, guiaStats } from './places.locations.js';
import { cacheControl } from '../../shared/http/cache-control.js';
import { z } from 'zod';

const CidadesQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  uf: z.string().trim().max(50).optional(),
  limit: z.coerce.number().int().min(1).max(1000).default(10),
});

export class PlacesController {
  constructor(private placesService: PlacesService) {}

  async search(request: FastifyRequest, reply: FastifyReply) {
    const query = SearchPlacesQuerySchema.parse(request.query);
    const { items, total } = await this.placesService.search(query);
    cacheControl(reply, { sMaxAge: 20, staleWhileRevalidate: 60 });
    return reply.header('X-Total-Count', total).status(200).send(items);
  }

  async getBySlug(request: FastifyRequest, reply: FastifyReply) {
    const { slug } = request.params as { slug: string };
    const place = await this.placesService.getBySlug(slug);
    cacheControl(reply, { sMaxAge: 10, staleWhileRevalidate: 60 });
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
    const { q, uf, limit } = CidadesQuerySchema.parse(request.query);
    const cities = await buscaCidades({ q, uf, limit });
    cacheControl(reply, { sMaxAge: 60, staleWhileRevalidate: 300 });
    return reply.status(200).send(cities);
  }

  async getStates(_request: FastifyRequest, reply: FastifyReply) {
    cacheControl(reply, { sMaxAge: 60, staleWhileRevalidate: 300 });
    return reply.status(200).send(await estadosComLugares());
  }

  async getStats(_request: FastifyRequest, reply: FastifyReply) {
    cacheControl(reply, { sMaxAge: 60, staleWhileRevalidate: 300 });
    return reply.status(200).send(await guiaStats());
  }
}
