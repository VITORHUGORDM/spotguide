import { HUD_PADRAO } from './hero-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api/v1';

export interface GuiaStats {
  lugares: number;
  cidades: number;
  avaliacoes: number;
  nota: number;
}

const PADRAO: GuiaStats = { ...HUD_PADRAO, cidades: 6 };

let cache: Promise<GuiaStats> | null = null;

/** Números reais da API (uma vez por página); valores de exemplo se ela não responder. */
export function carregaStats(): Promise<GuiaStats> {
  cache ??= (async () => {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 1500);
      const res = await fetch(`${API_BASE_URL}/places?limit=50`, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) return PADRAO;
      const lista: { city: string; totalReviews: number; averageRating: number }[] = await res.json();
      if (!lista.length) return PADRAO;

      const avaliacoes = lista.reduce((s, p) => s + p.totalReviews, 0);
      const somaNotas = lista.reduce((s, p) => s + p.averageRating * p.totalReviews, 0);
      return {
        lugares: lista.length,
        cidades: new Set(lista.map((p) => p.city.toLowerCase())).size,
        avaliacoes,
        nota: avaliacoes ? Number((somaNotas / avaliacoes).toFixed(1)) : PADRAO.nota,
      };
    } catch {
      return PADRAO;
    }
  })();
  return cache;
}
