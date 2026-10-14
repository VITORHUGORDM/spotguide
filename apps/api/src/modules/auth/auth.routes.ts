import { FastifyInstance } from 'fastify';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { authGuard } from '../../shared/middlewares/auth.guard.js';

export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService();
  const authController = new AuthController(authService);

  // Rate limit estrito em rotas de autenticação (mitigação de força bruta / credential stuffing)
  app.post(
    '/register',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },
    },
    authController.register.bind(authController)
  );

  app.post(
    '/login',
    {
      config: {
        rateLimit: {
          max: 5, // Apenas 5 tentativas por minuto por IP
          timeWindow: '1 minute',
        },
      },
    },
    authController.login.bind(authController)
  );

  app.get('/me', { preHandler: [authGuard] }, authController.me.bind(authController));
}
