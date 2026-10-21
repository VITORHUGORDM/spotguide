import { FastifyReply, FastifyRequest } from 'fastify';
import { RegisterInputSchema, LoginInputSchema, RefreshInputSchema } from '@guia/contracts';
import { AuthService } from './auth.service.js';
import { env } from '../../shared/env.js';
import { prisma } from '../../shared/database/prisma.js';

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(request: FastifyRequest, reply: FastifyReply) {
    // Validação estrita via Zod (Anti-Mass Assignment)
    const body = RegisterInputSchema.parse(request.body);

    const user = await this.authService.register(body);

    const accessToken = await reply.jwtSign(
      { sub: user.id, role: user.role, email: user.email, type: 'access' },
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    const refreshToken = await reply.jwtSign(
      { sub: user.id, role: user.role, email: user.email, type: 'refresh' },
      { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN }
    );

    return reply.status(201).send({
      user,
      accessToken,
      refreshToken,
    });
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const body = LoginInputSchema.parse(request.body);

    const user = await this.authService.validateCredentials(body);

    const accessToken = await reply.jwtSign(
      { sub: user.id, role: user.role, email: user.email, type: 'access' },
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    const refreshToken = await reply.jwtSign(
      { sub: user.id, role: user.role, email: user.email, type: 'refresh' },
      { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN }
    );

    return reply.status(200).send({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        createdAt: user.createdAt.toISOString(),
      },
      accessToken,
      refreshToken,
    });
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const { refreshToken } = RefreshInputSchema.parse(request.body);
    const invalido = () =>
      reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Sessão expirada. Entre novamente.' });

    let payload: { sub: string; type: string };
    try {
      payload = request.server.jwt.verify(refreshToken);
    } catch {
      return invalido();
    }
    // só refresh token renova: um access token roubado não vira sessão de 7 dias
    if (payload.type !== 'refresh') return invalido();

    // papel e e-mail vêm do banco, não do token antigo; conta apagada não renova
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, role: true, email: true } });
    if (!user) return invalido();

    const accessToken = await reply.jwtSign(
      { sub: user.id, role: user.role, email: user.email, type: 'access' },
      { expiresIn: env.JWT_EXPIRES_IN }
    );
    return reply.status(200).send({ accessToken });
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      userId: request.user.sub,
      role: request.user.role,
      email: request.user.email,
    });
  }
}
