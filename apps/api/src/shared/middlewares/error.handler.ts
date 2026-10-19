import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error.js';
import { env } from '../env.js';

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  // 1. Erros de validação Zod (Entrada inválida)
  if (error instanceof ZodError) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: 'Dados enviados na requisição são inválidos',
      issues: error.issues.map((i) => ({
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

  // 4. ID malformado (P2023) ou registro inexistente (P2025) vindos do Prisma
  if ((error as any).code === 'P2023') {
    return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: 'Identificador inválido.' });
  }
  if ((error as any).code === 'P2025') {
    return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'Registro não encontrado.' });
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
