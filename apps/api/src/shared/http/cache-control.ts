import { FastifyReply } from 'fastify';

interface Opcoes {
  /** segundos que navegador e CDN podem reaproveitar a resposta */
  sMaxAge: number;
  /** segundos extras servindo a resposta velha enquanto uma nova é buscada */
  staleWhileRevalidate?: number;
}

/** Só para rotas públicas e iguais para todo mundo (nunca para as do comerciante logado). */
export function cacheControl(reply: FastifyReply, { sMaxAge, staleWhileRevalidate = 0 }: Opcoes) {
  const swr = staleWhileRevalidate ? `, stale-while-revalidate=${staleWhileRevalidate}` : '';
  reply.header('Cache-Control', `public, max-age=${sMaxAge}, s-maxage=${sMaxAge}${swr}`);
}
