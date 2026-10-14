import { FastifyReply, FastifyRequest } from 'fastify';
import { RegisterInputSchema, LoginInputSchema } from '@guia/contracts';
import { AuthService } from './auth.service.js';

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(request: FastifyRequest, reply: FastifyReply) {
    // Validação estrita via Zod (Anti-Mass Assignment)
    const body = RegisterInputSchema.parse(request.body);

    const user = await this.authService.register(body);

    const accessToken = await reply.jwtSign(
      { sub: user.id, role: user.role, email: user.email },
      { expiresIn: '15m' }
    );

    const refreshToken = await reply.jwtSign(
      { sub: user.id, role: user.role, email: user.email },
      { expiresIn: '7d' }
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
      { sub: user.id, role: user.role, email: user.email },
      { expiresIn: '15m' }
    );

    const refreshToken = await reply.jwtSign(
      { sub: user.id, role: user.role, email: user.email },
      { expiresIn: '7d' }
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

  async me(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      userId: request.user.sub,
      role: request.user.role,
      email: request.user.email,
    });
  }
}
