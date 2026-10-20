import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    // valores só para os testes: nenhum acessa o banco
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://teste:teste@localhost:5432/teste',
      JWT_SECRET: 'segredo-de-teste-com-mais-de-32-caracteres-ok',
      REFRESH_TOKEN_SECRET: 'refresh-de-teste-com-mais-de-32-caracteres-ok',
      DOCUMENT_PEPPER: 'pepper-de-teste-com-mais-de-32-caracteres-ok',
    },
  },
});
