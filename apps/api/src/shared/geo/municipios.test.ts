import { describe, expect, it } from 'vitest';
import { MUNICIPIOS_POR_UF } from './municipios.data.js';
import { buscaMunicipios, municipioNaUf, municipiosDaUf, nomeOficial, semAcento } from './municipios.js';

describe('base de municípios do IBGE', () => {
  it('tem as 27 UFs e mais de 5.500 municípios', () => {
    expect(Object.keys(MUNICIPIOS_POR_UF)).toHaveLength(27);
    const total = Object.keys(MUNICIPIOS_POR_UF).reduce((s, uf) => s + municipiosDaUf(uf).length, 0);
    expect(total).toBeGreaterThan(5500);
  });

  it('conhece cidades de cada região', () => {
    expect(municipioNaUf('Gramado', 'RS')).toBe('Gramado');
    expect(municipioNaUf('Manaus', 'AM')).toBe('Manaus');
    expect(municipioNaUf('Brasília', 'DF')).toBe('Brasília');
  });
});

describe('semAcento', () => {
  it('tira acento, caixa e espaços repetidos', () => {
    expect(semAcento('  São   PAULO ')).toBe('sao paulo');
    expect(semAcento('Florianópolis')).toBe('florianopolis');
  });
});

describe('municipioNaUf', () => {
  it('ignora acento e caixa e devolve o nome oficial', () => {
    expect(municipioNaUf('sao paulo', 'SP')).toBe('São Paulo');
    expect(municipioNaUf('FLORIANOPOLIS', 'sc')).toBe('Florianópolis');
  });

  it('recusa cidade que não existe naquele estado', () => {
    expect(municipioNaUf('Gramado', 'SP')).toBeUndefined();
    expect(municipioNaUf('Cidade Inventada', 'RS')).toBeUndefined();
  });
});

describe('nomeOficial', () => {
  it('corrige a grafia quando acha, e devolve o texto original quando não', () => {
    expect(nomeOficial('campos do jordao')).toBe('Campos do Jordão');
    expect(nomeOficial('Lugar Que Não Existe')).toBe('Lugar Que Não Existe');
  });

  it('escolhe a UF certa quando o nome se repete', () => {
    expect(nomeOficial('Bom Jesus', 'RS')).toBe('Bom Jesus');
    expect(municipioNaUf('Bom Jesus', 'RS')).toBeDefined();
    expect(municipioNaUf('Bom Jesus', 'PB')).toBeDefined();
  });
});

describe('buscaMunicipios', () => {
  it('põe primeiro quem começa com o texto, depois palavras e depois o que contém', () => {
    const nomes = buscaMunicipios('gra', 'RS').map((m) => m.nome);
    expect(nomes[0]).toBe('Gramado');
    const primeiroSoContem = nomes.findIndex((n) => !semAcento(n).startsWith('gra') && !semAcento(n).includes(' gra'));
    const ultimoComecaCom = nomes.map((n) => semAcento(n).startsWith('gra')).lastIndexOf(true);
    if (primeiroSoContem !== -1) expect(ultimoComecaCom).toBeLessThan(primeiroSoContem);
  });

  it('filtra por UF e devolve vazio para texto vazio', () => {
    expect(buscaMunicipios('camp', 'SP').every((m) => m.uf === 'SP')).toBe(true);
    expect(buscaMunicipios('   ')).toEqual([]);
  });
});
