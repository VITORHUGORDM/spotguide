import { ApiClient, type GuiaStats } from './api-client';
import { HUD_PADRAO } from './hero-data';

export type { GuiaStats };

const PADRAO: GuiaStats = { ...HUD_PADRAO, cidades: 6, estados: 4 };

/** Números reais da API, ou os de exemplo se ela estiver fora do ar (a home continua abrindo). */
export async function buscaStats(): Promise<GuiaStats> {
  const stats = await ApiClient.getStats();
  return stats && stats.lugares > 0 ? stats : PADRAO;
}
