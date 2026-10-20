import { describe, expect, it } from 'vitest';
import { ESTADOS, estadoPorSlug, estadoPorUf, normalizaUf } from './brasil.js';
import { COMODIDADES, COMODIDADE_IDS, simboloPreco } from './comodidades.js';
import { RegisterInputSchema } from './auth.contract.js';
import { CreatePlaceInputSchema, SearchPlacesQuerySchema, UpdatePlaceInputSchema } from './place.contract.js';

const base = {
  categoryId: '88d2d6da-30b9-4f09-a8b3-268bb0e1e017',
  name: 'Bistrô da Serra',
  description: 'Cozinha da serra com lareira e carta de vinhos.',
  street: 'Rua Garibaldi',
  number: '210',
  neighborhood: 'Centro',
  city: 'Gramado',
  state: 'RS',
  postalCode: '95670-000',
  latitude: -29.37,
  longitude: -50.87,
};

const erros = (resultado: { success: boolean; error?: { issues: { path: (string | number)[]; message: string }[] } }) =>
  Object.fromEntries((resultado.error?.issues ?? []).map((i) => [i.path.join('.'), i.message]));

describe('estados', () => {
  it('tem os 27 estados, sem repetir sigla nem slug', () => {
    expect(ESTADOS).toHaveLength(27);
    expect(new Set(ESTADOS.map((e) => e.uf)).size).toBe(27);
    expect(new Set(ESTADOS.map((e) => e.slug)).size).toBe(27);
  });

  it('reconhece sigla, nome e slug', () => {
    expect(normalizaUf('rs')).toBe('RS');
    expect(normalizaUf('Rio Grande do Sul')).toBe('RS');
    expect(normalizaUf('são paulo')).toBe('SP');
    expect(normalizaUf('XX')).toBeUndefined();
    expect(estadoPorUf('sc')?.nome).toBe('Santa Catarina');
    expect(estadoPorSlug('mato-grosso-do-sul')?.uf).toBe('MS');
  });
});

describe('comodidades e preço', () => {
  it('mantém ids únicos', () => {
    expect(new Set(COMODIDADE_IDS).size).toBe(COMODIDADES.length);
  });

  it('converte nível em símbolo', () => {
    expect(simboloPreco(2)).toBe('$$');
    expect(simboloPreco(null)).toBeNull();
    expect(simboloPreco(9)).toBeNull();
  });
});

describe('cadastro de usuário', () => {
  const comum = { name: 'Ana Souza', email: 'ana@exemplo.com', password: 'Senha#Forte1' };

  it('viajante não precisa de documento', () => {
    expect(RegisterInputSchema.safeParse({ ...comum, role: 'TRAVELER' }).success).toBe(true);
  });

  it('comerciante precisa de CPF ou CNPJ válido', () => {
    expect(erros(RegisterInputSchema.safeParse({ ...comum, role: 'MERCHANT' })).document).toMatch(/CPF ou CNPJ/);
    expect(erros(RegisterInputSchema.safeParse({ ...comum, role: 'MERCHANT', document: '529.982.247-26' })).document).toMatch(/inválido/);
    expect(RegisterInputSchema.safeParse({ ...comum, role: 'MERCHANT', document: '529.982.247-25' }).success).toBe(true);
  });

  it('viajante não pode enviar documento', () => {
    expect(erros(RegisterInputSchema.safeParse({ ...comum, role: 'TRAVELER', document: '52998224725' })).document).toMatch(/comerciantes/);
  });

  it('recusa campos extras (mass assignment)', () => {
    expect(RegisterInputSchema.safeParse({ ...comum, role: 'TRAVELER', isVerified: true }).success).toBe(false);
  });

  it('aplica as regras de nome e senha', () => {
    const e = erros(RegisterInputSchema.safeParse({ name: 'Ana', email: 'ana@exemplo.com', password: 'abc', role: 'TRAVELER' }));
    expect(e.name).toBeDefined();
    expect(e.password).toMatch(/8 caracteres/);
  });
});

describe('cadastro de local', () => {
  it('normaliza telefone, link, estado, CEP, horários e comodidades', () => {
    const r = CreatePlaceInputSchema.safeParse({
      ...base,
      state: 'rio grande do sul',
      postalCode: '95670000',
      phone: '(54) 99999-0000',
      websiteUrl: 'instagram.com/bistro',
      amenities: ['WIFI', 'WIFI', 'PIX'],
      priceLevel: 2,
      hours: [{ day: 'MONDAY', openTime: '9:00', closeTime: '1800', isClosed: false }],
    });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data).toMatchObject({
      state: 'RS',
      postalCode: '95670-000',
      phone: '54999990000',
      websiteUrl: 'https://instagram.com/bistro',
      amenities: ['WIFI', 'PIX'],
      hours: [{ day: 'MONDAY', openTime: '09:00', closeTime: '18:00' }],
    });
  });

  it('aponta cada campo inválido', () => {
    const e = erros(
      CreatePlaceInputSchema.safeParse({ ...base, phone: '123', websiteUrl: 'javascript:alert(1)', state: 'XX', postalCode: '123' })
    );
    expect(e.phone).toMatch(/Telefone/);
    expect(e.websiteUrl).toMatch(/inválido/);
    expect(e.state).toMatch(/Estado/);
    expect(e.postalCode).toMatch(/CEP/);
  });

  it('valida horários', () => {
    const igual = erros(CreatePlaceInputSchema.safeParse({ ...base, hours: [{ day: 'MONDAY', openTime: '08:00', closeTime: '08:00', isClosed: false }] }));
    expect(Object.values(igual).join(' ')).toMatch(/iguais/);

    const repetido = CreatePlaceInputSchema.safeParse({
      ...base,
      hours: [
        { day: 'MONDAY', openTime: '08:00', closeTime: '18:00', isClosed: false },
        { day: 'MONDAY', openTime: '09:00', closeTime: '17:00', isClosed: false },
      ],
    });
    expect(repetido.success).toBe(false);
  });

  it('recusa comodidade desconhecida e faixa de preço fora de 1 a 4', () => {
    expect(CreatePlaceInputSchema.safeParse({ ...base, amenities: ['PISCINA_OLIMPICA'] }).success).toBe(false);
    expect(CreatePlaceInputSchema.safeParse({ ...base, priceLevel: 5 }).success).toBe(false);
  });

  it('atualização parcial não apaga campos que não vieram', () => {
    const r = UpdatePlaceInputSchema.safeParse({ name: 'Novo nome' });
    expect(r.success && r.data).toEqual({ name: 'Novo nome' });
  });
});

describe('busca de locais', () => {
  it('lê flags da querystring sem transformar "false" em true', () => {
    const r = SearchPlacesQuerySchema.parse({ openNow: 'false', hasPhoto: 'true', verified: '1' });
    expect(r.openNow).toBe(false);
    expect(r.hasPhoto).toBe(true);
    expect(r.verified).toBe(true);
  });

  it('aplica padrões e limites', () => {
    const r = SearchPlacesQuerySchema.parse({});
    expect(r).toMatchObject({ page: 1, limit: 20, radiusKm: 10 });
    expect(SearchPlacesQuerySchema.safeParse({ limit: 500 }).success).toBe(false);
    expect(SearchPlacesQuerySchema.safeParse({ maxPrice: 7 }).success).toBe(false);
  });
});
