import { MUNICIPIOS_POR_UF } from './municipios.data.js';

export interface Municipio {
  nome: string;
  uf: string;
  /** nome sem acento e em minúsculas, para comparar */
  chave: string;
}

export const semAcento = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

const POR_UF = new Map<string, Municipio[]>();
const POR_CHAVE = new Map<string, Municipio[]>();
const TODOS: Municipio[] = [];

for (const [uf, nomes] of Object.entries(MUNICIPIOS_POR_UF)) {
  const lista = nomes.split('|').map((nome) => ({ nome, uf, chave: semAcento(nome) }));
  POR_UF.set(uf, lista);
  for (const m of lista) {
    TODOS.push(m);
    const mesmoNome = POR_CHAVE.get(m.chave);
    if (mesmoNome) mesmoNome.push(m);
    else POR_CHAVE.set(m.chave, [m]);
  }
}

export const municipiosDaUf = (uf: string): readonly Municipio[] => POR_UF.get(uf.toUpperCase()) ?? [];

/** "sao paulo" -> "São Paulo". Sem acento/caixa certa, devolve o próprio texto. */
export function nomeOficial(cidade: string, uf?: string): string {
  const achados = POR_CHAVE.get(semAcento(cidade));
  if (!achados?.length) return cidade;
  return (uf && achados.find((m) => m.uf === uf.toUpperCase())?.nome) || achados[0].nome;
}

/** Nome oficial do município naquela UF (ignora acento e caixa), ou undefined se não existir lá. */
export function municipioNaUf(cidade: string, uf: string): string | undefined {
  return POR_CHAVE.get(semAcento(cidade))?.find((m) => m.uf === uf.toUpperCase())?.nome;
}

/**
 * Busca por nome, ignorando acento e caixa.
 * Ordem: começa com o texto, depois uma palavra começa com ele, depois contém.
 */
export function buscaMunicipios(texto: string, uf?: string): Municipio[] {
  const q = semAcento(texto);
  if (!q) return [];

  const base = uf ? municipiosDaUf(uf) : TODOS;
  const faixas: Municipio[][] = [[], [], []];
  for (const m of base) {
    const i = m.chave.indexOf(q);
    if (i === -1) continue;
    faixas[i === 0 ? 0 : m.chave[i - 1] === ' ' ? 1 : 2].push(m);
  }
  return faixas.flat();
}
