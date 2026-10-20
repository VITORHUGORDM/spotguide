import { formataCep } from '@guia/contracts/validadores';
import { AppError } from '../../shared/errors/app-error.js';
import { nomeOficial } from '../../shared/geo/municipios.js';

export interface EnderecoCep {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

type Resposta = { achou: EnderecoCep } | 'nao-existe' | 'indisponivel';

const TEMPO_MS = 3500;
const GUARDA_ACHADO_MS = 24 * 60 * 60 * 1000;
const GUARDA_AUSENTE_MS = 60 * 60 * 1000;
const MAX_NA_MEMORIA = 2000;

const memoria = new Map<string, { ate: number; endereco: EnderecoCep | null }>();

async function pedeJson(url: string): Promise<{ status: number; corpo: any } | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TEMPO_MS), headers: { Accept: 'application/json' } });
    if (res.status >= 500) return null;
    return { status: res.status, corpo: await res.json().catch(() => null) };
  } catch {
    return null;
  }
}

const monta = (cep: string, street: unknown, neighborhood: unknown, city: unknown, state: unknown): EnderecoCep => {
  const uf = String(state ?? '').toUpperCase();
  return {
    cep: formataCep(cep),
    street: String(street ?? '').trim(),
    neighborhood: String(neighborhood ?? '').trim(),
    // o nome da cidade volta do jeito oficial do IBGE (com acento e caixa certos)
    city: nomeOficial(String(city ?? '').trim(), uf),
    state: uf,
  };
};

async function viaCep(cep: string): Promise<Resposta> {
  const r = await pedeJson(`https://viacep.com.br/ws/${cep}/json/`);
  if (!r) return 'indisponivel';
  // o ViaCEP responde 200 com { erro: true } quando o CEP não existe (ou é geral da cidade)
  if (r.status !== 200 || !r.corpo || r.corpo.erro) return 'nao-existe';
  return { achou: monta(cep, r.corpo.logradouro, r.corpo.bairro, r.corpo.localidade, r.corpo.uf) };
}

async function brasilApi(cep: string): Promise<Resposta> {
  const r = await pedeJson(`https://brasilapi.com.br/api/cep/v1/${cep}`);
  if (!r) return 'indisponivel';
  if (r.status !== 200 || !r.corpo?.city) return 'nao-existe';
  return { achou: monta(cep, r.corpo.street, r.corpo.neighborhood, r.corpo.city, r.corpo.state) };
}

/**
 * Procura o CEP no ViaCEP e, se não achar, no BrasilAPI (que conhece os CEPs gerais de cidade pequena).
 * Devolve null se o CEP não existe; lança 503 se nenhum dos dois serviços respondeu.
 */
export async function buscaCep(cep: string): Promise<EnderecoCep | null> {
  const guardado = memoria.get(cep);
  if (guardado && guardado.ate > Date.now()) return guardado.endereco;

  const respostas: Resposta[] = [];
  for (const consulta of [viaCep, brasilApi]) {
    const r = await consulta(cep);
    if (typeof r === 'object') return guarda(cep, r.achou);
    respostas.push(r);
  }

  // ninguém respondeu: não dá para afirmar que o CEP não existe, então não guardamos nada
  if (respostas.every((r) => r === 'indisponivel')) {
    throw new AppError('Não conseguimos consultar o CEP agora. Preencha o endereço manualmente.', 503);
  }
  return guarda(cep, null);
}

function guarda(cep: string, endereco: EnderecoCep | null) {
  if (memoria.size >= MAX_NA_MEMORIA) memoria.delete(memoria.keys().next().value as string);
  memoria.set(cep, { ate: Date.now() + (endereco ? GUARDA_ACHADO_MS : GUARDA_AUSENTE_MS), endereco });
  return endereco;
}
