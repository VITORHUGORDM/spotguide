import { buildApp } from './app.js';
import { env } from './shared/env.js';
import { prisma } from './shared/database/prisma.js';

async function bootstrap() {
  const app = buildApp();

  try {
    const address = await app.listen({ port: env.PORT, host: env.HOST });
    console.log(`🚀 API Guia Turístico rodando em: ${address}`);
    console.log(`🔒 Modo: ${env.NODE_ENV}`);
  } catch (err) {
    console.error('Falha ao iniciar o servidor:', err);
    process.exit(1);
  }

  // Graceful Shutdown
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      console.log(`\nRecebido ${signal}. Encerrando conexões com segurança...`);
      await app.close();
      await prisma.$disconnect();
      process.exit(0);
    });
  }
}

bootstrap();
