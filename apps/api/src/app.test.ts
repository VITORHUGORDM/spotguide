import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from './app.js';

/**
 * Testes de integração das rotas, sem banco: só exercitam o que é decidido antes de consultar o banco
 * (validação, autenticação e formato das respostas de erro).
 */
const app = buildApp();

beforeAll(() => app.ready());
afterAll(() => app.close());

const json = (res: { body: string }) => JSON.parse(res.body);

describe('saúde', () => {
  it('responde /health', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(json(res).status).toBe('healthy');
  });
});

describe('validação devolve 400 com a mensagem de cada campo', () => {
  // regressão: o Zod dos contratos e o da API são cópias diferentes, e o erro chegava como 500
  it('cadastro com dados inválidos', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { name: 'Maria', email: 'x', password: 'abc', role: 'MERCHANT' },
    });
    expect(res.statusCode).toBe(400);
    const caminhos = json(res).issues.map((i: { path: string }) => i.path);
    expect(caminhos).toEqual(expect.arrayContaining(['name', 'email', 'password', 'document']));
  });

  it('comerciante com CPF inválido', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { name: 'Maria Souza', email: 'maria@exemplo.com', password: 'Senha#Forte1', role: 'MERCHANT', document: '529.982.247-26' },
    });
    expect(res.statusCode).toBe(400);
    expect(json(res).issues[0]).toMatchObject({ path: 'document' });
  });

  it('busca com parâmetros fora dos limites', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/places?limit=500&maxPrice=9' });
    expect(res.statusCode).toBe(400);
  });
});

describe('CEP', () => {
  it('recusa CEP malformado sem consultar serviço externo', async () => {
    for (const cep of ['123', '00000000', 'abcdefgh']) {
      const res = await app.inject({ method: 'GET', url: `/api/v1/lookup/cep/${cep}` });
      expect(res.statusCode).toBe(400);
      expect(json(res).issues[0].path).toBe('postalCode');
    }
  });
});

describe('autenticação', () => {
  it('exige login para cadastrar local', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/v1/places', payload: {} });
    expect(res.statusCode).toBe(401);
  });

  it('exige login para listar os locais do comerciante', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/places/merchant/my-places' });
    expect(res.statusCode).toBe(401);
  });

  it('não aceita token inventado', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/places',
      headers: { authorization: 'Bearer token.falso.qualquer' },
      payload: {},
    });
    expect(res.statusCode).toBe(401);
  });
});

describe('favoritos', () => {
  const token = () => app.jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', role: 'TRAVELER', type: 'access' });

  it('exige login em listar, favoritar e desfavoritar', async () => {
    const id = '22222222-2222-4222-8222-222222222222';
    for (const [method, url] of [['GET', '/api/v1/favorites'], ['PUT', `/api/v1/favorites/${id}`], ['DELETE', `/api/v1/favorites/${id}`]] as const) {
      expect((await app.inject({ method, url })).statusCode).toBe(401);
    }
  });

  it('recusa refresh token', async () => {
    const refresh = app.jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', role: 'TRAVELER', type: 'refresh' });
    const res = await app.inject({ method: 'GET', url: '/api/v1/favorites', headers: { authorization: `Bearer ${refresh}` } });
    expect(res.statusCode).toBe(401);
  });

  it('recusa id que não é UUID antes de consultar o banco', async () => {
    const res = await app.inject({ method: 'PUT', url: '/api/v1/favorites/abc', headers: { authorization: `Bearer ${token()}` } });
    expect(res.statusCode).toBe(400);
  });
});

describe('rate limit', () => {
  // regressão: o limite funcionava, mas o erro chegava como 500
  it('responde 429 (não 500) depois de 5 logins por minuto', async () => {
    const tenta = () => app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: {}, remoteAddress: '203.0.113.7' });
    const codigos: number[] = [];
    for (let i = 0; i < 7; i++) codigos.push((await tenta()).statusCode);
    expect(codigos.slice(0, 5).every((c) => c === 400)).toBe(true);
    expect(codigos.slice(5)).toEqual([429, 429]);
  });
});

describe('CORS', () => {
  const preflight = (origin: string) =>
    app.inject({ method: 'OPTIONS', url: '/api/v1/favorites/x', headers: { origin, 'access-control-request-method': 'PUT' } });

  it('libera a origem do site e nega as outras, mesmo em desenvolvimento', async () => {
    expect((await preflight('http://localhost:3000')).headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect((await preflight('https://evil.example')).headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('roteiros', () => {
  const id = '22222222-2222-4222-8222-222222222222';
  const auth = () => ({ authorization: `Bearer ${app.jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', role: 'TRAVELER', type: 'access' })}` });

  it('exige login para listar, criar, editar e apagar', async () => {
    for (const [method, url] of [['GET', '/api/v1/itineraries'], ['POST', '/api/v1/itineraries'], ['PUT', `/api/v1/itineraries/${id}`], ['DELETE', `/api/v1/itineraries/${id}`]] as const) {
      expect((await app.inject({ method, url })).statusCode).toBe(401);
    }
  });

  it('recusa id que não é UUID e campos fora do contrato', async () => {
    expect((await app.inject({ method: 'GET', url: '/api/v1/itineraries/abc' })).statusCode).toBe(400);
    const put = (payload: object) => app.inject({ method: 'PUT', url: `/api/v1/itineraries/${id}`, headers: auth(), payload });
    expect((await put({ ownerId: 'x' })).statusCode).toBe(400); // mass assignment
    expect((await put({})).statusCode).toBe(400);
    expect((await put({ placeIds: [id, id] })).statusCode).toBe(400); // repetido
    expect((await put({ placeIds: Array.from({ length: 31 }, (_, i) => `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`) })).statusCode).toBe(400);
  });
});

describe('renovação do login', () => {
  const refresh = (payload: object) => app.inject({ method: 'POST', url: '/api/v1/auth/refresh', payload, remoteAddress: '203.0.113.9' });

  it('recusa token inventado, access token e corpo fora do contrato', async () => {
    expect((await refresh({ refreshToken: 'falso.falso.falso' })).statusCode).toBe(401);
    const access = app.jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', role: 'TRAVELER', type: 'access' });
    expect((await refresh({ refreshToken: access })).statusCode).toBe(401); // access não renova
    expect((await refresh({})).statusCode).toBe(400);
    expect((await refresh({ refreshToken: 'x', role: 'ADMIN' })).statusCode).toBe(400);
  });
});
