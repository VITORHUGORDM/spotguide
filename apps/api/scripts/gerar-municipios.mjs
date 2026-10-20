/**
 * Baixa os 5.570 municípios do IBGE e grava src/shared/geo/municipios.data.ts.
 * Só precisa rodar de novo se o IBGE criar/renomear município:
 *   node apps/api/scripts/gerar-municipios.mjs
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const URL_IBGE = 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome';
const destino = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/shared/geo/municipios.data.ts');

const res = await fetch(URL_IBGE);
if (!res.ok) throw new Error(`IBGE respondeu ${res.status}`);
const lista = await res.json();

const porUf = {};
for (const m of lista) {
  const uf = (m.microrregiao?.mesorregiao?.UF ?? m['regiao-imediata']?.['regiao-intermediaria']?.UF)?.sigla;
  if (!uf) throw new Error(`Município sem UF: ${m.nome}`);
  (porUf[uf] ??= []).push(m.nome);
}

const ufs = Object.keys(porUf).sort();
if (ufs.length !== 27) throw new Error(`Esperava 27 UFs, veio ${ufs.length}`);

// um texto por UF (nomes separados por "|") mantém o arquivo pequeno e rápido de carregar
const linhas = ufs.map((uf) => `  ${uf}: ${JSON.stringify(porUf[uf].sort((a, b) => a.localeCompare(b, 'pt-BR')).join('|'))},`);
const total = ufs.reduce((s, uf) => s + porUf[uf].length, 0);

await mkdir(path.dirname(destino), { recursive: true });
await writeFile(
  destino,
  `// Gerado por scripts/gerar-municipios.mjs a partir da API de localidades do IBGE (${total} municípios). Não edite à mão.\n` +
    `export const MUNICIPIOS_POR_UF: Record<string, string> = {\n${linhas.join('\n')}\n};\n`,
  'utf8'
);
console.log(`${total} municípios em ${ufs.length} UFs -> ${destino}`);
