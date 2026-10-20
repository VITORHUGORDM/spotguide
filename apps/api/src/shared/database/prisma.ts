import { PrismaClient } from '@prisma/client';
import { env } from '../env.js';

// Logar toda query deixa o modo dev lento; ligue com PRISMA_LOG_QUERIES=1 quando precisar depurar SQL.
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' && process.env.PRISMA_LOG_QUERIES ? ['query', 'error', 'warn'] : ['error'],
});
