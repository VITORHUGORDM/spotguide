import { normalizaUf } from '@guia/contracts/brasil';
import { prisma } from '../../shared/database/prisma.js';
import { TtlCache } from '../../shared/cache.js';
import { buscaMunicipios, municipiosDaUf, semAcento } from '../../shared/geo/municipios.js';

export interface CidadeOpcao {
  city: string;
  state: string;
  count: number;
}

export interface GuiaStats {
  lugares: number;
  cidades: number;
  estados: number;
  avaliacoes: number;
  nota: number;
}

/** Sugestões quando ainda não há texto digitado e nenhum filtro de estado. */
const DESTINOS_POPULARES: Array<[string, string]> = [
  ['Gramado', 'RS'],
  ['Campos do Jordão', 'SP'],
  ['Florianópolis', 'SC'],
  ['Rio de Janeiro', 'RJ'],
  ['São Paulo', 'SP'],
  ['Curitiba', 'PR'],
  ['Balneário Camboriú', 'SC'],
  ['Porto Alegre', 'RS'],
  ['Salvador', 'BA'],
  ['Belo Horizonte', 'MG'],
  ['Bonito', 'MS'],
  ['Paraty', 'RJ'],
  ['Foz do Iguaçu', 'PR'],
  ['Jericoacoara', 'CE'],
  ['Maragogi', 'AL'],
];

const chaveCidade = (cidade: string, uf: string) => `${semAcento(cidade)}|${uf}`;

/** Uma consulta resume o catálogo todo; é reaproveitada por stats, estados e cidades. */
const catalogo = new TtlCache(30_000, async () => {
  const linhas = await prisma.$queryRaw<
    { city: string; state: string; lugares: number; avaliacoes: number; soma: number }[]
  >`
    SELECT city, state,
           COUNT(*)::int AS lugares,
           COALESCE(SUM(total_reviews), 0)::int AS avaliacoes,
           COALESCE(SUM(average_rating * total_reviews), 0)::float8 AS soma
    FROM places
    WHERE is_active = TRUE
    GROUP BY city, state
  `;

  const cidades = new Map<string, CidadeOpcao>();
  const estados = new Map<string, number>();
  let lugares = 0;
  let avaliacoes = 0;
  let soma = 0;

  for (const l of linhas) {
    const uf = normalizaUf(l.state) ?? l.state.toUpperCase();
    const chave = chaveCidade(l.city, uf);
    const atual = cidades.get(chave);
    if (atual) atual.count += l.lugares;
    else cidades.set(chave, { city: l.city, state: uf, count: l.lugares });
    estados.set(uf, (estados.get(uf) ?? 0) + l.lugares);
    lugares += l.lugares;
    avaliacoes += l.avaliacoes;
    soma += l.soma;
  }

  const stats: GuiaStats = {
    lugares,
    cidades: cidades.size,
    estados: estados.size,
    avaliacoes,
    nota: avaliacoes ? Number((soma / avaliacoes).toFixed(1)) : 0,
  };
  return { cidades, estados, stats };
});

export async function guiaStats(): Promise<GuiaStats> {
  return (await catalogo.get()).stats;
}

/** Estados que já têm lugares cadastrados. */
export async function estadosComLugares(): Promise<{ uf: string; count: number }[]> {
  const { estados } = await catalogo.get();
  return Array.from(estados, ([uf, count]) => ({ uf, count })).sort((a, b) => b.count - a.count || a.uf.localeCompare(b.uf));
}

interface BuscaCidades {
  q?: string;
  uf?: string;
  limit: number;
}

/**
 * Autocomplete de cidades: os 5.571 municípios do IBGE + qualquer cidade já cadastrada,
 * com a contagem de lugares. Cidades com lugares aparecem antes das vazias.
 */
export async function buscaCidades({ q, uf, limit }: BuscaCidades): Promise<CidadeOpcao[]> {
  const { cidades } = await catalogo.get();
  const estado = uf ? normalizaUf(uf) : undefined;
  const contagem = (cidade: string, sigla: string) => cidades.get(chaveCidade(cidade, sigla))?.count ?? 0;

  const texto = q?.trim() ?? '';
  const vistos = new Set<string>();
  const saida: CidadeOpcao[] = [];
  const add = (city: string, state: string) => {
    const chave = chaveCidade(city, state);
    if (vistos.has(chave)) return;
    vistos.add(chave);
    saida.push({ city, state, count: contagem(city, state) });
  };

  if (texto) {
    // a ordem do IBGE (começa com > palavra > contém) vale mais que a contagem; dentro de cada faixa, quem tem lugares sobe
    const achados = buscaMunicipios(texto, estado);
    const chave = semAcento(texto);
    const faixa = (nome: string) => {
      const i = semAcento(nome).indexOf(chave);
      return i === 0 ? 0 : nome[i - 1] === ' ' ? 1 : 2;
    };
    const ordenados = achados
      .map((m) => ({ m, faixa: faixa(m.nome), count: contagem(m.nome, m.uf) }))
      .sort((a, b) => a.faixa - b.faixa || b.count - a.count || a.m.nome.localeCompare(b.m.nome, 'pt-BR'));
    for (const { m } of ordenados) add(m.nome, m.uf);

    // cidades cadastradas que não estão na lista oficial (grafia diferente, distrito...)
    for (const c of cidades.values()) {
      if ((!estado || c.state === estado) && semAcento(c.city).includes(chave)) add(c.city, c.state);
    }
  } else if (estado) {
    const lista = municipiosDaUf(estado).map((m) => ({ nome: m.nome, count: contagem(m.nome, estado) }));
    lista.sort((a, b) => b.count - a.count || a.nome.localeCompare(b.nome, 'pt-BR'));
    for (const c of lista) add(c.nome, estado);
    for (const c of cidades.values()) if (c.state === estado) add(c.city, c.state);
  } else {
    const comLugares = [...cidades.values()].sort((a, b) => b.count - a.count || a.city.localeCompare(b.city, 'pt-BR'));
    for (const c of comLugares) add(c.city, c.state);
    for (const [cidade, sigla] of DESTINOS_POPULARES) add(cidade, sigla);
  }

  return saida.slice(0, limit);
}
