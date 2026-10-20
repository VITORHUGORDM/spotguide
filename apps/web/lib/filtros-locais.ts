import { COMODIDADE_IDS, type ComodidadeId } from '@guia/contracts/comodidades';
import type { SearchParams } from './api-client';

export const ORDENS = [
  { valor: '', rotulo: 'Melhor avaliados' },
  { valor: 'reviews', rotulo: 'Mais avaliados' },
  { valor: 'recent', rotulo: 'Mais recentes' },
  { valor: 'name', rotulo: 'Nome (A–Z)' },
  { valor: 'distance', rotulo: 'Mais perto de mim' },
] as const;

export const NOTAS = [
  { valor: undefined, rotulo: 'Qualquer' },
  { valor: 3, rotulo: '3+' },
  { valor: 4, rotulo: '4+' },
  { valor: 4.5, rotulo: '4,5+' },
] as const;

export const RAIOS_KM = [5, 10, 25, 50] as const;

export interface Filtros {
  busca: string;
  estado: string;
  cidade: string;
  categorias: string[];
  avaliacao?: number;
  ordem: string;
  aberto: boolean;
  comFoto: boolean;
  verificado: boolean;
  /** faixa de preço máxima (1 a 4) */
  preco?: number;
  comodidades: string[];
}

export const FILTROS_VAZIOS: Filtros = {
  busca: '',
  estado: '',
  cidade: '',
  categorias: [],
  avaliacao: undefined,
  ordem: '',
  aberto: false,
  comFoto: false,
  verificado: false,
  preco: undefined,
  comodidades: [],
};

/** A URL é a fonte da verdade: dá para compartilhar, voltar e recarregar a busca. */
export function filtrosDaUrl(sp: URLSearchParams): Filtros {
  const nota = Number(sp.get('avaliacao'));
  const preco = Number(sp.get('preco'));
  return {
    busca: sp.get('busca') ?? '',
    estado: (sp.get('estado') ?? '').toUpperCase(),
    cidade: sp.get('cidade') ?? '',
    categorias: (sp.get('categoria') ?? '').split(',').filter(Boolean),
    avaliacao: nota >= 1 && nota <= 5 ? nota : undefined,
    ordem: sp.get('ordem') ?? '',
    aberto: sp.get('aberto') === '1',
    comFoto: sp.get('foto') === '1',
    verificado: sp.get('verificado') === '1',
    preco: Number.isInteger(preco) && preco >= 1 && preco <= 4 ? preco : undefined,
    // só ids que existem: link com lixo na URL não quebra a busca
    comodidades: (sp.get('comodidades') ?? '').split(',').filter((c) => COMODIDADE_IDS.includes(c as ComodidadeId)),
  };
}

export function filtrosParaUrl(f: Filtros): string {
  const sp = new URLSearchParams();
  if (f.busca.trim()) sp.set('busca', f.busca.trim());
  if (f.estado) sp.set('estado', f.estado);
  if (f.cidade.trim()) sp.set('cidade', f.cidade.trim());
  if (f.categorias.length) sp.set('categoria', f.categorias.join(','));
  if (f.avaliacao) sp.set('avaliacao', String(f.avaliacao));
  if (f.ordem) sp.set('ordem', f.ordem);
  if (f.aberto) sp.set('aberto', '1');
  if (f.comFoto) sp.set('foto', '1');
  if (f.verificado) sp.set('verificado', '1');
  if (f.preco) sp.set('preco', String(f.preco));
  if (f.comodidades.length) sp.set('comodidades', f.comodidades.join(','));
  return sp.toString();
}

export interface Perto {
  lat: number;
  lng: number;
  raioKm: number;
}

export function filtrosParaApi(f: Filtros, perto: Perto | null): SearchParams {
  return {
    search: f.busca.trim() || undefined,
    state: f.estado || undefined,
    city: f.cidade.trim() || undefined,
    categorySlug: f.categorias.length ? f.categorias.join(',') : undefined,
    minRating: f.avaliacao,
    sort: (f.ordem || undefined) as SearchParams['sort'],
    openNow: f.aberto || undefined,
    hasPhoto: f.comFoto || undefined,
    verified: f.verificado || undefined,
    maxPrice: f.preco,
    amenities: f.comodidades.length ? f.comodidades.join(',') : undefined,
    ...(perto ? { lat: perto.lat, lng: perto.lng, radiusKm: perto.raioKm } : {}),
  };
}

export const contaFiltros = (f: Filtros, perto: boolean) =>
  [f.busca.trim(), f.estado, f.cidade.trim(), f.categorias.length, f.avaliacao, f.ordem, f.aberto, f.comFoto, f.verificado, f.preco, f.comodidades.length, perto].filter(
    Boolean
  ).length;
