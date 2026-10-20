import { FastifyReply, FastifyRequest } from 'fastify';
import { RegisterInputSchema, LoginInputSchema, RefreshInputSchema, UserResponse } from '@guia/contracts';
import { AuthService } from './auth.service.js';
import { env } from '../../shared/env.js';
import { AppError } from '../../shared/errors/app-error.js';

export class AuthController {
  constructor(private authService: AuthService) {}

  /** Access token (JWT_SECRET, curto) e refresh token (REFRESH_TOKEN_SECRET, longo): um não vale no lugar do outro. */
  private emiteTokens(request: FastifyRequest, user: Pick<UserResponse, 'id' | 'role' | 'email'>) {
    const base = { sub: user.id, role: user.role, email: user.email };
    return {
      accessToken: request.server.jwt.sign({ ...base, type: 'access' }, { expiresIn: env.JWT_EXPIRES_IN }),
      refreshToken: request.server.jwt.sign(
        { ...base, type: 'refresh' },
        { key: env.REFRESH_TOKEN_SECRET, expiresIn: env.REFRESH_TOKEN_EXPIRES_IN }
      ),
    };
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    // Validação estrita via Zod (Anti-Mass Assignment)
    const body = RegisterInputSchema.parse(request.body);

    const user = await this.authService.register(body);

    return reply.status(201).send({ user, ...this.emiteTokens(request, user) });
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const body = LoginInputSchema.parse(request.body);

    const user = await this.authService.validateCredentials(body);

    return reply.status(200).send({ user, ...this.emiteTokens(request, user) });
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const { refreshToken } = RefreshInputSchema.parse(request.body);

    let sub: string;
    try {
      const payload = request.server.jwt.verify<{ sub: string; type: string }>(refreshToken, {
        key: env.REFRESH_TOKEN_SECRET,
      });
      if (payload.type !== 'refresh') throw new Error('Tipo de token inválido');
      sub = payload.sub;
    } catch {
      throw new AppError('Sessão expirada. Entre novamente.', 401);
    }

    // busca de novo: o papel pode ter mudado e a conta pode ter sido removida
    const user = await this.authService.findById(sub);
    if (!user) throw new AppError('Sessão expirada. Entre novamente.', 401);

    return reply.status(200).send({ user, ...this.emiteTokens(request, user) });
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      userId: request.user.sub,
      role: request.user.role,
      email: request.user.email,
    });
  }
}
