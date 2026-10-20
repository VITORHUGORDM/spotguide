import { FastifyInstance } from 'fastify';
import { soDigitos, validaCep } from '@guia/contracts/validadores';
import { AppError } from '../../shared/errors/app-error.js';
import { cacheControl } from '../../shared/http/cache-control.js';
import { buscaCep } from './cep.service.js';

export async function lookupRoutes(app: FastifyInstance) {
  // Endereço a partir do CEP (preenche o formulário do comerciante). Limite próprio: chama serviços externos.
  app.get(
    '/cep/:cep',
    { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } },
    async (request, reply) => {
      const { cep } = request.params as { cep: string };
      if (!validaCep(cep)) throw new AppError('CEP inválido. Use 8 dígitos.', 400, 'postalCode');

      const endereco = await buscaCep(soDigitos(cep));
      if (!endereco) throw new AppError('CEP não encontrado. Confira os números ou preencha o endereço à mão.', 404, 'postalCode');

      cacheControl(reply, { sMaxAge: 86_400 });
      return reply.status(200).send(endereco);
    }
  );
}
