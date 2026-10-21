import { FastifyInstance, FastifyRequest } from 'fastify';
import { CreateItineraryInputSchema, ItineraryParamsSchema, UpdateItineraryInputSchema } from '@guia/contracts';
import { ItinerariesService } from './itineraries.service.js';
import { authGuard } from '../../shared/middlewares/auth.guard.js';

/** Quem está vendo, se houver login válido; roteiro público também abre para visitante. */
async function viewerId(request: FastifyRequest) {
  try {
    await request.jwtVerify();
    return request.user.type === 'access' ? request.user.sub : null;
  } catch {
    return null;
  }
}

const limite = (max: number) => ({ preHandler: [authGuard], config: { rateLimit: { max, timeWindow: '1 minute' } } });

export async function itinerariesRoutes(app: FastifyInstance) {
  const service = new ItinerariesService();
  // tudo aqui depende de quem pergunta: nada de cache compartilhado
  app.addHook('onSend', async (_req, reply) => void reply.header('Cache-Control', 'private, no-store'));

  app.get('/', { preHandler: [authGuard] }, (request) => service.listMine(request.user.sub));

  app.post('/', limite(10), async (request, reply) => {
    const body = CreateItineraryInputSchema.parse(request.body);
    return reply.status(201).send(await service.create(request.user.sub, body));
  });

  app.get('/:id', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (request) => {
    const { id } = ItineraryParamsSchema.parse(request.params);
    return service.get(id, await viewerId(request));
  });

  app.put('/:id', limite(30), async (request) => {
    const { id } = ItineraryParamsSchema.parse(request.params);
    return service.update(request.user.sub, id, UpdateItineraryInputSchema.parse(request.body));
  });

  app.delete('/:id', limite(30), async (request, reply) => {
    const { id } = ItineraryParamsSchema.parse(request.params);
    await service.remove(request.user.sub, id);
    return reply.status(204).send();
  });
}
