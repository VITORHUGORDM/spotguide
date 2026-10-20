#  Plataforma Guia Turístico & Comercial (SpotGuide)

> Arquitetura corporativa em Monorepo (Clean Architecture, DDD, Security by Design) servindo Web (Next.js), Mobile (React Native / Expo) e Backend API (Node.js / Fastify / PostgreSQL).

---

## 🏗️ Visão Geral da Arquitetura

Este repositório adota o modelo **Enterprise Monorepo com Turborepo**, permitindo que Web, Mobile e Backend compartilhem o mesmo contrato de tipos e validações Zod, eliminando qualquer risco de dessincronização de APIs ou vulnerabilidades de injeção de dados.

```
guia-turistico/
├── apps/
│   ├── api/                     # Backend REST API (Fastify + Prisma + PostgreSQL + PostGIS)
│   ├── web/                     # Frontend Web (Next.js 15 App Router + Tailwind CSS + SEO)
│   └── mobile/                  # Frontend Mobile (Expo 52 + React Native + NativeWind v4 + GPS)
│
├── packages/
│   ├── contracts/               # Contratos Zod compartilhados (DTOs, Schemas, Types)
│   └── tsconfig/                # Configurações TypeScript padronizadas
│
├── turbo.json                   # Pipeline de build e cache distribuído Turborepo
└── pnpm-workspace.yaml          # Gerenciamento de dependências e links de pacotes
```

---

## 🛡️ Pilares de Segurança Implementados (Security by Design)

1. **Anti-Mass Assignment (.strict() nos Contratos Zod):**
   - Todas as mutações (`CreatePlaceInputSchema`, `RegisterInputSchema`, etc.) usam validação estrita. Campos extras como `role`, `isVerified`, `averageRating` enviados por clientes maliciosos são imediatamente rejeitados antes de atingir as camadas de serviço ou banco.
2. **Anti-IDOR (Insecure Direct Object References):**
   - Implementação do middleware `placeOwnershipGuard`, garantindo que comerciantes só possam atualizar ou excluir seus próprios estabelecimentos, com bypass restrito a usuários com privilégio `ADMIN`.
3. **Prevenção de TOCTTOU & Inconsistências de Concorrência:**
   - O cálculo de médias e contagem de avaliações em `reviews.service.ts` é executado dentro de uma transação atômica do Prisma (`$transaction`), acompanhado de restrição de unicidade no banco (`UNIQUE(place_id, user_id)`).
4. **Proteção contra Excessive Data Exposure:**
   - Senhas criptografadas com salt rounds 12 via `bcryptjs`.
   - DTOs explícitos de resposta (`UserResponseSchema`, `PlaceListItemSchema`).
   - Handler global de erros que mascara exceções e stack traces em ambiente de produção.
5. **Rate Limiting Granular:**
   - Proteção global por IP e limites estritos para autenticação (máximo de 5 tentativas de login por minuto).
6. **CORS Restritivo e Headers de Segurança:**
   - Configuração do `@fastify/helmet` e controle estrito de `ALLOWED_ORIGINS`.

---

## 🚀 Como Executar o Projeto Localmente

### 1. Pré-requisitos
* Node.js >= 20
* pnpm (`npm install -g pnpm`)
* Instância do PostgreSQL em execução

### 2. Configurar o Banco de Dados
No arquivo `apps/api/.env`, certifique-se de apontar a variável `DATABASE_URL` para o seu PostgreSQL:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/guia_turistico?schema=public"
```

### 3. Rodar Migrações e Seed do Banco
```bash
# Na raiz do monorepo:
pnpm --filter @guia/api db:migrate
pnpm --filter @guia/api db:seed
```

### 4. Executar os Projetos Simultaneamente com Turborepo
```bash
pnpm dev
```
* **API Backend:** `http://localhost:3333`
* **Web Next.js:** `http://localhost:3000`
* **Mobile Expo:** Abrirá o Expo Metro Bundler para testar no Expo Go ou emulador.

---

## 📡 Endpoints Principais da API (v1)

| Método | Rota | Descrição | Nível de Acesso |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Cadastro de usuário (Viajante / Comerciante) | Público (Rate-Limited) |
| `POST` | `/api/v1/auth/login` | Login e emissão de JWT | Público (5 req/min) |
| `GET` | `/api/v1/auth/me` | Dados do usuário autenticado | Autenticado |
| `GET` | `/api/v1/categories` | Listagem de categorias | Público |
| `GET` | `/api/v1/places` | Busca e filtros (Raio GPS, Cidade, Categoria) | Público |
| `GET` | `/api/v1/places/slug/:slug`| Detalhes do local (SEO-Friendly) | Público |
| `GET` | `/api/v1/places/id/:id` | Detalhes do local por UUID | Público |
| `GET` | `/api/v1/places/merchant/my-places` | Lista os estabelecimentos do comerciante logado | Comerciante / Admin |
| `POST` | `/api/v1/places` | Cadastro de estabelecimento | Comerciante / Admin |
| `PUT` | `/api/v1/places/:id` | Atualização do estabelecimento | Dono do Local (Anti-IDOR) |
| `DELETE`| `/api/v1/places/:id` | Exclusão do estabelecimento | Dono do Local (Anti-IDOR) |
| `GET` | `/api/v1/reviews/place/:placeId` | Avaliações do local | Público |
| `POST` | `/api/v1/reviews/place/:placeId` | Envio de avaliação atômica | Autenticado (Viajante) |
| `POST` | `/api/v1/reviews/:reviewId/reply`| Resposta do comerciante à avaliação | Dono do Local (Comerciante) |

---

## 🌐 Rotas do Frontend Web (Next.js)

* `/` - Página Inicial (Hero com busca direcionada, categorias e destinos populares)
* `/locais` - Exploração com busca dinâmica, filtro por cidade, categoria e notas
* `/locais/[slug]` - Página pública do local com rotas no Google Maps, galeria, horários e avaliações
* `/comerciante` - Portal e Painel com métricas, listagem e gestão dos estabelecimentos cadastrados
* `/comerciante/locais/novo` - Formulário completo para cadastrar novo estabelecimento com GPS e horários
* `/comerciante/locais/[id]/editar` - Edição protegida de dados do estabelecimento
* `/login` - Autenticação com redirecionamento contextual por papel
* `/cadastro` - Criação de conta com seleção de perfil (Viajante ou Comerciante)

---

## 📱 Rotas Mobile (Expo / React Native)

* `/` (`app/index.tsx`) - Feed com GPS ativo, busca instantânea e categorias
* `/places/[slug]` (`app/places/[slug].tsx`) - Detalhes do estabelecimento, traçado de rotas com GPS e discador rápido

