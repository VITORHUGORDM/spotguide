import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PhotosService } from './photos.service.js';
import { authGuard } from '../../shared/middlewares/auth.guard.js';
import { roleGuard } from '../../shared/middlewares/role.guard.js';
import { placeOwnershipGuard } from '../../shared/middlewares/idor.guard.js';
import { AppError } from '../../shared/errors/app-error.js';

const ParamsFoto = z.object({ id: z.string().uuid(), photoId: z.string().uuid() });

export async function photosRoutes(app: FastifyInstance) {
  const service = new PhotosService();
  const guards = [authGuard, roleGuard(['MERCHANT', 'ADMIN']), placeOwnershipGuard];

  app.post(
    '/:id/photos',
    {
      preHandler: guards,
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const arquivo = await request.file();
      if (!arquivo) throw new AppError('Nenhum arquivo enviado.', 400);

      const buf = await arquivo.toBuffer();
      // toBuffer não falha ao truncar: o plugin só marca a flag
      if (arquivo.file.truncated) throw new AppError('A imagem passa de 5 MB.', 413);

      const legenda = typeof arquivo.fields.caption === 'object' && arquivo.fields.caption && 'value' in arquivo.fields.caption
        ? String((arquivo.fields.caption as { value: unknown }).value)
        : undefined;

      const foto = await service.add(id, buf, legenda);
      return reply.status(201).send(foto);
    }
  );

  app.delete('/:id/photos/:photoId', { preHandler: guards }, async (request, reply) => {
    const { id, photoId } = ParamsFoto.parse(request.params);
    await service.remove(id, photoId);
    return reply.status(204).send();
  });

  app.put('/:id/photos/:photoId/cover', { preHandler: guards }, async (request, reply) => {
    const { id, photoId } = ParamsFoto.parse(request.params);
    await service.setCover(id, photoId);
    return reply.status(204).send();
  });
}
