import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error.js';
import { env } from '../env.js';

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  // 1. Erros de validação Zod (Entrada inválida)
  // Os schemas vêm de @guia/contracts (CJS) e este arquivo importa o zod como ESM: são duas cópias da
  // classe, então `instanceof` falha. Reconhecer pelo nome mantém o 400 em vez de um 500.
  if (error instanceof ZodError || (error as { name?: string }).name === 'ZodError') {
    const { issues } = error as unknown as ZodError;
    return reply.status(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: issues[0]?.message ?? 'Dados enviados na requisição são inválidos',
      issues: issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    });
  }

  // 2. Erros de Domínio / Negócio controlados
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.message,
      message: error.message,
      ...(error.field && { issues: [{ path: error.field, message: error.message }] }),
    });
  }

  // 3. Violações de unicidade no banco (ex.: Prisma P2002)
  if ((error as any).code === 'P2002') {
    return reply.status(409).send({
      statusCode: 409,
      error: 'Conflict',
      message: 'Um registro com estes dados únicos já existe.',
    });
  }

  if ((error as any).code === 'FST_REQ_FILE_TOO_LARGE') {
    return reply.status(413).send({ statusCode: 413, error: 'Payload Too Large', message: 'A imagem passa de 5 MB.' });
  }

  // 4. ID malformado (P2023) ou registro inexistente (P2025) vindos do Prisma
  if ((error as any).code === 'P2023') {
    return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: 'Identificador inválido.' });
  }
  if ((error as any).code === 'P2025') {
    return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'Registro não encontrado.' });
  }

  // 4b. Rate limit estourado: o plugin lança um erro com statusCode 429 (sem isto caía no 500)
  if (error.statusCode === 429) {
    return reply.status(429).send({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Muitas tentativas em pouco tempo. Aguarde um instante e tente de novo.',
    });
  }

  // 5. Erros não tratados (Internal Server Error)
  // SEGURANÇA: NUNCA expor stack traces ou dados sensíveis do banco para o cliente
  request.log.error(error);

  return reply.status(500).send({
    statusCode: 500,
    error: 'Internal Server Error',
    message: env.NODE_ENV === 'development' ? error.message : 'Ocorreu um erro interno inesperado no servidor.',
  });
}
