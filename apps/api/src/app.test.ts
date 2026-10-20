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

  it('refresh recusa token inventado, vencido ou de acesso', async () => {
    const base = { sub: '00000000-0000-0000-0000-000000000000', role: 'TRAVELER' as const, email: 'a@b.com' };
    const deAcesso = app.jwt.sign({ ...base, type: 'access' });
    const vencido = app.jwt.sign(
      { ...base, type: 'refresh', exp: Math.floor(Date.now() / 1000) - 10 },
      { key: process.env.REFRESH_TOKEN_SECRET }
    );
    for (const refreshToken of ['token.falso.qualquer', deAcesso, vencido]) {
      const res = await app.inject({ method: 'POST', url: '/api/v1/auth/refresh', payload: { refreshToken } });
      expect(res.statusCode).toBe(401);
    }
  });

  it('refresh token não serve como token de acesso', async () => {
    const refresh = app.jwt.sign(
      { sub: '00000000-0000-0000-0000-000000000000', role: 'MERCHANT', email: 'a@b.com', type: 'refresh' },
      { key: process.env.REFRESH_TOKEN_SECRET }
    );
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/places/merchant/my-places',
      headers: { authorization: `Bearer ${refresh}` },
    });
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
