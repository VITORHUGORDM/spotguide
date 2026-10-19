import { FastifyReply, FastifyRequest } from 'fastify';

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    // Refresh tokens n„o podem ser usados para acessar recursos
    if (request.user.type !== 'access') throw new Error('Tipo de token inv·lido');
  } catch (err) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Token de autentica√ß√£o inv√°lido ou expirado.',
    });
  }
}
