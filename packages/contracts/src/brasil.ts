/**
 * Estados do Brasil. Fica fora do index de propósito: o site importa
 * "@guia/contracts/brasil" e não arrasta o zod para o navegador.
 */

export type Regiao = 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';

export interface Estado {
  uf: string;
  nome: string;
  slug: string;
  regiao: Regiao;
}

export const ESTADOS: readonly Estado[] = [
  { uf: 'AC', nome: 'Acre', slug: 'acre', regiao: 'Norte' },
  { uf: 'AL', nome: 'Alagoas', slug: 'alagoas', regiao: 'Nordeste' },
  { uf: 'AP', nome: 'Amapá', slug: 'amapa', regiao: 'Norte' },
  { uf: 'AM', nome: 'Amazonas', slug: 'amazonas', regiao: 'Norte' },
  { uf: 'BA', nome: 'Bahia', slug: 'bahia', regiao: 'Nordeste' },
  { uf: 'CE', nome: 'Ceará', slug: 'ceara', regiao: 'Nordeste' },
  { uf: 'DF', nome: 'Distrito Federal', slug: 'distrito-federal', regiao: 'Centro-Oeste' },
  { uf: 'ES', nome: 'Espírito Santo', slug: 'espirito-santo', regiao: 'Sudeste' },
  { uf: 'GO', nome: 'Goiás', slug: 'goias', regiao: 'Centro-Oeste' },
  { uf: 'MA', nome: 'Maranhão', slug: 'maranhao', regiao: 'Nordeste' },
  { uf: 'MT', nome: 'Mato Grosso', slug: 'mato-grosso', regiao: 'Centro-Oeste' },
  { uf: 'MS', nome: 'Mato Grosso do Sul', slug: 'mato-grosso-do-sul', regiao: 'Centro-Oeste' },
  { uf: 'MG', nome: 'Minas Gerais', slug: 'minas-gerais', regiao: 'Sudeste' },
  { uf: 'PA', nome: 'Pará', slug: 'para', regiao: 'Norte' },
  { uf: 'PB', nome: 'Paraíba', slug: 'paraiba', regiao: 'Nordeste' },
  { uf: 'PR', nome: 'Paraná', slug: 'parana', regiao: 'Sul' },
  { uf: 'PE', nome: 'Pernambuco', slug: 'pernambuco', regiao: 'Nordeste' },
  { uf: 'PI', nome: 'Piauí', slug: 'piaui', regiao: 'Nordeste' },
  { uf: 'RJ', nome: 'Rio de Janeiro', slug: 'rio-de-janeiro', regiao: 'Sudeste' },
  { uf: 'RN', nome: 'Rio Grande do Norte', slug: 'rio-grande-do-norte', regiao: 'Nordeste' },
  { uf: 'RS', nome: 'Rio Grande do Sul', slug: 'rio-grande-do-sul', regiao: 'Sul' },
  { uf: 'RO', nome: 'Rondônia', slug: 'rondonia', regiao: 'Norte' },
  { uf: 'RR', nome: 'Roraima', slug: 'roraima', regiao: 'Norte' },
  { uf: 'SC', nome: 'Santa Catarina', slug: 'santa-catarina', regiao: 'Sul' },
  { uf: 'SP', nome: 'São Paulo', slug: 'sao-paulo', regiao: 'Sudeste' },
  { uf: 'SE', nome: 'Sergipe', slug: 'sergipe', regiao: 'Nordeste' },
  { uf: 'TO', nome: 'Tocantins', slug: 'tocantins', regiao: 'Norte' },
];

export const REGIOES: readonly Regiao[] = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];

const semAcento = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

const POR_UF = new Map(ESTADOS.map((e) => [e.uf, e]));
const POR_TEXTO = new Map<string, Estado>();
for (const e of ESTADOS) {
  POR_TEXTO.set(e.uf.toLowerCase(), e);
  POR_TEXTO.set(semAcento(e.nome), e);
}

export const estadoPorUf = (uf: string) => POR_UF.get(uf.toUpperCase());
export const estadoPorSlug = (slug: string) => ESTADOS.find((e) => e.slug === slug);

/** Aceita "sp", "SP" ou "São Paulo" e devolve a sigla; undefined se não for um estado. */
export function normalizaUf(texto: string | null | undefined): string | undefined {
  if (!texto) return undefined;
  return POR_TEXTO.get(semAcento(texto))?.uf;
}
