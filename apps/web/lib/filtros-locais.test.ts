import { describe, expect, it } from 'vitest';
import { contaFiltros, filtrosDaUrl, filtrosParaApi, filtrosParaUrl } from './filtros-locais';

const daUrl = (qs: string) => filtrosDaUrl(new URLSearchParams(qs));

describe('filtros da busca na URL', () => {
  it('lê todos os filtros', () => {
    const f = daUrl('busca=caf%C3%A9&estado=sc&cidade=Florian%C3%B3polis&categoria=cafes,bares&avaliacao=4&ordem=name&aberto=1&foto=1&verificado=1&preco=2&comodidades=WIFI,PIX');
    expect(f).toEqual({
      busca: 'café',
      estado: 'SC',
      cidade: 'Florianópolis',
      categorias: ['cafes', 'bares'],
      avaliacao: 4,
      ordem: 'name',
      aberto: true,
      comFoto: true,
      verificado: true,
      preco: 2,
      comodidades: ['WIFI', 'PIX'],
    });
  });

  it('volta para a mesma URL (ida e volta)', () => {
    const qs = 'busca=pizza&estado=RS&cidade=Gramado&categoria=restaurantes&avaliacao=4.5&aberto=1&preco=3&comodidades=PET_FRIENDLY';
    expect(filtrosParaUrl(daUrl(qs))).toBe(new URLSearchParams(qs).toString());
  });

  it('ignora lixo na URL em vez de quebrar a busca', () => {
    const f = daUrl('avaliacao=99&preco=9&comodidades=WIFI,INVENTADA&aberto=talvez');
    expect(f.avaliacao).toBeUndefined();
    expect(f.preco).toBeUndefined();
    expect(f.comodidades).toEqual(['WIFI']);
    expect(f.aberto).toBe(false);
  });

  it('URL vazia dá filtros vazios e conta zero', () => {
    const f = daUrl('');
    expect(filtrosParaUrl(f)).toBe('');
    expect(contaFiltros(f, false)).toBe(0);
  });
});

describe('filtros para a API', () => {
  it('só manda o que está ligado', () => {
    const api = filtrosParaApi(daUrl('estado=RS&aberto=1&preco=2&comodidades=WIFI,PIX&categoria=bares,cafes'), null);
    expect(api).toMatchObject({
      state: 'RS',
      openNow: true,
      maxPrice: 2,
      amenities: 'WIFI,PIX',
      categorySlug: 'bares,cafes',
    });
    expect(api.hasPhoto).toBeUndefined();
    expect(api.lat).toBeUndefined();
  });

  it('inclui a posição quando "perto de mim" está ativo', () => {
    const api = filtrosParaApi(daUrl(''), { lat: -29.37, lng: -50.87, raioKm: 25 });
    expect(api).toMatchObject({ lat: -29.37, lng: -50.87, radiusKm: 25 });
  });

  it('conta os filtros ativos, incluindo "perto de mim"', () => {
    expect(contaFiltros(daUrl('estado=RS&preco=2&comodidades=WIFI'), true)).toBe(4);
  });
});
