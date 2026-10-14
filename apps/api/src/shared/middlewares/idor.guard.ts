import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../database/prisma.js';

export async function placeOwnershipGuard(request: FastifyRequest, reply: FastifyReply) {
  const { id: placeId } = request.params as { id: string };
  const currentUserId = request.user.sub;
  const currentUserRole = request.user.role;

  // Administradores têm permissão de gerenciamento global
  if (currentUserRole === 'ADMIN') {
    return;
  }

  const place = await prisma.place.findUnique({
    where: { id: placeId },
    select: { ownerId: true },
  });

  if (!place) {
    return reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: 'Estabelecimento não encontrado.',
    });
  }

  // IDOR Mitigation: Usuário só pode modificar se for o dono legítimo
  if (place.ownerId !== currentUserId) {
    return reply.status(403).send({
      statusCode: 403,
      error: 'Forbidden',
      message: 'Você não tem permissão para alterar este estabelecimento.',
    });
  }
}
