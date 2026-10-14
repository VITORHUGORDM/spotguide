import { FastifyReply, FastifyRequest } from 'fastify';

export function roleGuard(allowedRoles: Array<'TRAVELER' | 'MERCHANT' | 'ADMIN'>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userRole = request.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return reply.status(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Você não tem permissão para acessar este recurso.',
      });
    }
  };
}
