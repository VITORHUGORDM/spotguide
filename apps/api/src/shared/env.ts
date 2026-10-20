import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3333),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter ao menos 32 caracteres para segurança'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().min(32, 'REFRESH_TOKEN_SECRET deve ter ao menos 32 caracteres'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  // segredo do hash de CPF/CNPJ; separado do JWT para poder girar um sem afetar o outro
  DOCUMENT_PEPPER: z.string().min(32).optional(),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  PUBLIC_URL: z.string().url().default('http://localhost:3333'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://localhost:8081'),
  // Atrás de proxy/load balancer, sem isso todo mundo chega com o IP do proxy e divide o mesmo rate limit.
  // "true" (confia em todos), número de saltos ("1") ou IPs/CIDRs separados por vírgula. Só ligue se houver proxy:
  // sem proxy na frente, qualquer um forjaria o próprio IP pelo X-Forwarded-For.
  TRUST_PROXY: z
    .string()
    .trim()
    .optional()
    .transform((v): boolean | string | ((endereco: string, salto: number) => boolean) => {
      if (!v || v === 'false') return false;
      if (v === 'true') return true;
      if (!/^\d+$/.test(v)) return v;
      // confia nos N saltos mais próximos (o formato que o Fastify aceita para "número de proxies")
      const saltos = Number(v);
      return (_endereco, salto) => salto < saltos;
    }),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Variáveis de ambiente inválidas:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
