import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';

import { env } from './shared/env.js';
import { errorHandler } from './shared/middlewares/error.handler.js';

import { authRoutes } from './modules/auth/auth.routes.js';
import { categoriesRoutes } from './modules/categories/categories.routes.js';
import { placesRoutes } from './modules/places/places.routes.js';
import { reviewsRoutes } from './modules/reviews/reviews.routes.js';
import { lookupRoutes } from './modules/lookup/lookup.routes.js';
import { photosRoutes } from './modules/photos/photos.routes.js';
import { UPLOADS_DIR } from './modules/photos/photos.service.js';

export function buildApp() {
  const app = fastify({
    logger: env.NODE_ENV === 'development',
    disableRequestLogging: env.NODE_ENV === 'production',
  });

  // 1. Headers de Segurança HTTP (Helmet)
  app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production',
  });

  // 1b. Gzip/Brotli: as listas de lugares e cidades encolhem bem
  app.register(compress, { threshold: 512 });

  // 2. CORS Restritivo (Zero Trust: apenas origens autorizadas)
  const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  app.register(cors, {
    origin: (origin, cb) => {
      // Permite requisições sem origin (ex: mobile apps ou cURL em dev)
      if (!origin || allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
        cb(null, true);
        return;
      }
      cb(new Error('Origem não permitida pela política CORS'), false);
    },
    credentials: true,
    // o site lê o total de resultados deste cabeçalho
    exposedHeaders: ['X-Total-Count'],
  });

  // 3. Rate Limit Global (Sliding Window / Prevenção de DoS e Abuse)
  app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
  });

  // 4. JWT Authentication Plugin
  app.register(jwt, {
    secret: env.JWT_SECRET,
  });

  // 4b. Upload de fotos (1 arquivo por vez, até 5 MB) e arquivos estáticos
  app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 4 } });
  app.register(fastifyStatic, {
    root: UPLOADS_DIR,
    prefix: '/uploads/',
    // o nome de cada arquivo é um UUID novo a cada envio, então o navegador pode guardar para sempre
    maxAge: '365d',
    immutable: true,
    // o site (outra porta) precisa poder carregar as imagens
    setHeaders: (reply) => void reply.header('Cross-Origin-Resource-Policy', 'cross-origin'),
  });

  // 5. Handler Centralizado de Erros (Prevenção de Data Exposure)
  app.setErrorHandler(errorHandler);

  // 6. Health Check para Orquestradores (Docker/K8s/AWS)
  app.get('/health', async () => {
    return { status: 'healthy', timestamp: new Date().toISOString() };
  });

  // 7. Registro de Rotas Versionadas (/api/v1)
  app.register(authRoutes, { prefix: '/api/v1/auth' });
  app.register(categoriesRoutes, { prefix: '/api/v1/categories' });
  app.register(placesRoutes, { prefix: '/api/v1/places' });
  app.register(photosRoutes, { prefix: '/api/v1/places' });
  app.register(reviewsRoutes, { prefix: '/api/v1/reviews' });
  app.register(lookupRoutes, { prefix: '/api/v1/lookup' });

  return app;
}
