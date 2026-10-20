import { describe, expect, it, vi } from 'vitest';

/**
 * Rate limit do login (5 por minuto por IP) com e sem TRUST_PROXY. O corpo vazio para na validação,
 * então nenhum teste acessa o banco; o limite conta a tentativa antes disso.
 */
async function appCom(trustProxy?: string) {
  vi.resetModules();
  if (trustProxy === undefined) delete process.env.TRUST_PROXY;
  else process.env.TRUST_PROXY = trustProxy;
  const { buildApp } = await import('./app.js');
  const app = buildApp();
  await app.ready();
  return app;
}

const tentaLogin = (app: Awaited<ReturnType<typeof appCom>>, ip: string) =>
  app.inject({ method: 'POST', url: '/api/v1/auth/login', headers: { 'x-forwarded-for': ip }, payload: {} });

describe('rate limit atrás de proxy', () => {
  it('sem TRUST_PROXY, X-Forwarded-For forjado não escapa do limite', async () => {
    const app = await appCom();
    const status = [];
    for (let i = 0; i < 6; i++) status.push((await tentaLogin(app, `203.0.113.${i}`)).statusCode);
    expect(status.slice(0, 5)).toEqual([400, 400, 400, 400, 400]);
    expect(status[5]).toBe(429);
    await app.close();
  });

  it('JSON malformado é 400, não 500', async () => {
    const app = await appCom();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/reviews/place/00000000-0000-0000-0000-000000000000',
      headers: { 'content-type': 'application/json' },
      payload: '{ quebrado',
    });
    // sem login chega antes no 401; o que importa é não ser 500
    expect(res.statusCode).toBeLessThan(500);
    const login = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      headers: { 'content-type': 'application/json' },
      payload: '{ quebrado',
    });
    expect(login.statusCode).toBe(400);
    await app.close();
  });

  it('com TRUST_PROXY=1, cada visitante tem o próprio limite', async () => {
    const app = await appCom('1');
    for (let i = 0; i < 5; i++) await tentaLogin(app, '203.0.113.10');
    expect((await tentaLogin(app, '203.0.113.10')).statusCode).toBe(429);
    // outro visitante, mesmo proxy: ainda pode tentar
    expect((await tentaLogin(app, '203.0.113.20')).statusCode).toBe(400);
    await app.close();
  });
});
