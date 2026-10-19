# SpotGuide — hero com a "ilha flutuante" (prompt adaptado)

Este prompt adapta o hero do estilo "Zênite" (ilha flutuante em camadas de nuvens) para o **SpotGuide**. Cole no Claude Code dentro do monorepo (`apps/web`). Ele substitui só a primeira dobra de `apps/web/app/page.tsx` e a navbar da home; o resto da home (destaques, cidades, CTA de comerciante) continua como está.

## O que mudou em relação ao prompt original

| Original (Zênite) | SpotGuide |
| --- | --- |
| Vite + HTML/CSS/JS puros | **Next.js 15 (App Router) + React 19 + Tailwind**, componentes `'use client'` |
| Marca de energia solar, Goiânia | Guia turístico e comercial brasileiro |
| Casa com painéis solares na ilha | **Ilha com um pedaço do Brasil**: um bonde/mirante, coqueiros, um farol, uma barraca de praia, um pin de mapa enorme (ver "Arte da ilha") |
| Céu de manhã, creme e tinta | Céu de **fim de tarde** (dourado → rosa → roxo), combinando com o tema escuro atual (`#030305`, roxo `#a855f7`) |
| HUD: relógio, kW gerados | HUD: **cidade e hora** + "N lugares perto de você" + nota média |
| Botão "Simular minha conta" | Botão **"Explorar locais"** (`/locais`) e secundário **"Sou comerciante"** (`/comerciante`) |
| Fechamento com dados do sistema | Fechamento com **busca por cidade** (reaproveita `CityAutocomplete`) e linha de números da plataforma |
| Fontes Archivo + Plex Mono | Mesmas, via `@fontsource-variable/archivo` e `@fontsource/ibm-plex-mono` (no `layout.tsx`, só no hero) |

## Pré-requisito: os arquivos de arte

O prompt original depende de uma pasta `arquivos/` (ilha em WebP com alfa, 7 nuvens recortadas, `favicon.svg`) e de um `CLAUDE.md` com as posições exatas das nuvens. **Eles não estão neste repositório.** Antes de começar, uma destas opções:

1. **Você tem o pacote do Zênite:** copie `arquivos/img/*` para `apps/web/public/img/` e o `CLAUDE.md` do pacote para uma pasta de referência. As nuvens servem como estão; só a ilha precisa ser trocada (opção 2 ou 3).
2. **Ilha própria:** gere/ilustre uma ilha 1446×994, fundo transparente, e salve em `apps/web/public/img/ilha.webp`.
3. **Sem arte ainda:** construa a ilha como **SVG inline** feito à mão (terra vermelha, raízes, pedras penduradas, coqueiros, farol, pin) e as nuvens como SVG com `feTurbulence`/blobs com máscara macia, deixando o componente já preparado para trocar por `<img>` depois.

Se faltar o `CLAUDE.md`, use as posições deste prompt e ajuste olhando os prints.

---

## Prompt

### A marca
**SpotGuide** é um guia turístico e comercial: o viajante encontra restaurantes, cafés, bares, hospedagem e pontos turísticos perto de si, com rota no Google Maps e avaliação de quem foi. O comerciante cadastra e gerencia o próprio local.

Tom: concreto, número e lugar na frente. Fala de cidade, nota, distância e rota. Nada de "experiências inesquecíveis", "descubra o mundo" ou "turismo inteligente". Todo o texto em português do Brasil, com acentos.

Cores: céu do topo ao horizonte `#1b1647`, `#3b2a78`, `#8a4a8f`, `#d9697a`, `#f2a65a`, névoa `#fbd9a8`; creme `#faf6ee` (nome, texto e botão); tinta `#0b0b14`; fundo do site `#030305`; destaque roxo `#a855f7` (só em detalhes, para casar com o resto do site).

Tipografia: **Archivo** variável com eixo de largura, sempre `font-variation-settings: 'wdth' 106`, e **IBM Plex Mono** 400 para HUD e rótulos. O resto do site mantém a fonte atual.

### A ideia
Uma ilha de terra vermelha com raízes e pedras penduradas, **solta no céu do fim de tarde**, carregando um Brasil em miniatura (coqueiros, farol, bondinho, barraca de praia e um pin de mapa gigante cravado no centro). Nuvens passam na frente e atrás, em camadas recortadas em profundidades diferentes. O nome "SpotGuide" gigante fica embaixo, sentado nas nuvens.

O risco é as camadas parecerem coladas. O que costura tudo: recortes com alfa macio e base das nuvens desfeita, uma névoa quente na base da ilha, nuvens repetidas com tamanho diferente e espelhadas, e **um grão de filme só por cima de tudo**. Regra de ouro: **nenhuma camada termina numa linha reta visível**, nem no hero nem na saída. Toda ponta é degradê (`mask-image`) ou fica sempre fora da tela.

### A cena, de trás para a frente
O hero é um palco de 100svh **sticky** enquanto a página rola mais 100svh (a saída). Camadas absolutas em tela cheia:

1. **Céu**: gradiente vertical (`#1b1647` 0%, `#3b2a78` 20%, `#8a4a8f` 42%, `#d9697a` 58%, `#f2a65a` 72%, `#fbd9a8` 88%), sol radial no canto superior direito e clarão quente largo no horizonte. Serra distante em SVG (`#7a5a8c`, opacidade 0,4, blur 1,5px) a 55% da altura, base desfeita por máscara `linear-gradient(#000 30%, transparent 92%)`.
2. **Nuvens de longe**: pequenas, mais frias, com blur leve.
3. **Mar de nuvens do horizonte**: cúmulo alto à esquerda e dois bancos largos, com faixa de névoa quente por baixo. Nunca aparece céu escuro no pé da tela. As faixas de névoa descem 2–3 alturas abaixo da tela.
4. **A ilha** (`ilha.webp` ou SVG), centro em 51,5% x 40,5%, largura `min(62vw, 96svh)`, filtro `saturate(.9) contrast(.96)`. Camada por cima usando a própria ilha como máscara: roxo do céu a 16% no lado esquerdo (sombra) e névoa a 16–36% nos 25% de baixo. Névoa radial atrás da base.
5. **Nuvens da frente**: bancos largos passando sobre a base da ilha e atrás do nome.
6. **Sombra de nuvem** parada, do tamanho do palco (se subisse com as nuvens, a borda apareceria como faixa): gradientes de `rgba(8,6,24,…)` a ~40% atrás do parágrafo, ~20% atrás do nome, ~30% subindo do pé.
7. **Texto e interface**.
8. **Grão**: ladrilho de ruído de 180px gerado em canvas, `position: fixed`, `mix-blend-mode: soft-light`, opacidade 0,3, trocando de posição em saltos (`steps`) a cada ~0,1s.

### Texto e interface
- **Navbar** (substitui a sticky atual só na home): barra centrada, 14px da borda, cantos 18px, `rgba(11,11,20,.45)` + `backdrop-filter: blur(14px)`. Links: "Locais" (`/locais`), "Cidades" (`#cidades`), "Sou comerciante" (`/comerciante`), "Entrar" (`/login`). **Some ao descer e volta ao subir**; sempre visível no topo e ao receber foco. Nas demais páginas continua a navbar atual. Mantenha o estado de login do `AuthContext` (mostrar nome/sair quando logado).
- **HUD** em Plex Mono 12,5px, creme, sombra suave, números tabulares:
  - canto superior esquerdo: "18:40 · Gramado · 29°22′S" / "Perto de você 12 lugares";
  - canto superior direito: "Nota média 4,7 · 340 avaliações".
  - Os números vêm de `GET /api/v1/places` (contagem e média) quando a API responde; senão, usa esses valores de exemplo. A cidade vem da geolocalização se o usuário permitir (nunca peça permissão no carregamento; só mostre o valor de exemplo).
- **Nome**: "SpotGuide" gigante, embaixo à esquerda, Archivo 560, tracking −0,055em, `min(15vw, 28svh)`, creme. Depois, um **pin de mapa** em SVG (no lugar do asterisco-sol), 0,29em, como expoente, balançando devagar.
- **À direita**, alinhado com a base do nome (três linhas fixas, Archivo 460, ~20px): "Restaurantes, bares, hotéis e / pontos turísticos perto de você, / com rota e nota de quem foi." Embaixo, botão pílula creme **"Explorar locais"** (círculo tinta com seta que gira −45° no hover) e, ao lado, link de texto "Sou comerciante".
- **No pé, ao centro**: "[ role para ver as cidades ]" em mono 11,5px.

### Movimento
- **Nuvens derivando** para a direita em loop sem emenda (CSS, atraso negativo), cada camada numa velocidade.
- **Ilha flutuando**: ±0,8% da altura em 7,5s, ±0,3° de giro.
- **Parallax do cursor**: até 26px (x) e 14px (y) × profundidade (céu 0,05; longe 0,18; horizonte 0,34; ilha 0,58; frente 1), suavizado ~5% por quadro. Só com mouse.
- **Entrada em camadas** (GSAP) depois de ilha, nuvens e fontes carregarem (máx. 3s): começa na névoa; céu aparece; nuvens sobem; **a ilha sobe 20% e cresce de 0,94 a 1** (2,8s); nuvens da frente; **nome letra a letra por máscara** (65ms entre letras); pin; parágrafo linha a linha; nav e botões; **HUD conta** (hora de 17:40 a 18:40, lugares de 0 a 12, nota de 0 a 4,7) em 1,9s. Tudo em ~4s.
- **Saída no scroll** pelo progresso `p` (0–1) nos 100svh de rolagem, suavizado: camadas sobem `p × velocidade × altura` (céu 0,06; longe 0,16; horizonte 0,32; ilha 0,6 e encolhe a 86%; frente 1,25 e cresce a 138%); a ilha some na névoa entre `p` 0,28 e 0,58; um **muro de nuvens** grandes e levemente desfocadas, em três fileiras, sobe cobrindo tudo; nome, parágrafo e botões somem até 0,3; HUD até 0,22; um véu da cor `#030305` aparece de 0,5 a 0,9; o conteúdo seguinte sobe 45svh por cima do fim do hero (`margin-top: -45svh`) com gradiente de 45svh na borda de cima (transparente → `#030305`).

### Depois do hero
A seção atual de **destaques** (`#destaques`), cidades e CTA de comerciante seguem como estão. Acrescente, logo depois do hero e antes de `#destaques`, um bloco curto `#cidades`:
- "[ para onde você vai ]" em mono;
- título "Escolha a cidade, / a gente mostra o que está aberto." (Archivo 520, `clamp(2rem, 4.4vw, 4.6rem)`);
- o `CityAutocomplete` existente, estilizado em pílula;
- **linha de dados** de borda a borda, seis colunas com fios finos, rótulo mono e valor embaixo: Locais "N" · Cidades "N" · Categorias "5" · Avaliações "N" · Nota média "4,7" · Rota "Google Maps". Valores reais da API quando disponíveis.

### Celular
- Ilha centralizada, 98vw, centro a 32% da altura.
- Nome em 24vw cabendo na largura com o pin; embaixo, parágrafo (~16px) e botões empilhados à esquerda, 22px de margem no pé.
- Nav em largura cheia (margens 16px), links distribuídos; HUD em 11px logo abaixo, nos dois cantos.
- Dica de rolagem escondida. Menos nuvens, maiores. Mesma saída. Linha de dados em 2 colunas.

### Acessibilidade e movimento reduzido
- `h1` com o nome (a versão letra a letra é `aria-hidden`), `alt` descritivo na ilha, nuvens com `alt=""`, foco visível.
- `prefers-reduced-motion: reduce`: sem deriva, flutuação, parallax, giro/balanço do pin e saída; o hero não fica preso (a base se desfaz em `#030305`); o HUD já aparece com os valores.
- O parágrafo tem que ficar legível sobre qualquer nuvem: confira nos prints e reforce a sombra se preciso.

---

## Como construir (stack Next.js)

- Instale com versão travada: `pnpm --filter web add --save-exact gsap @fontsource-variable/archivo @fontsource/ibm-plex-mono` (confira o nome do pacote em `apps/web/package.json`).
- Estrutura em `apps/web`:
  - `components/hero/` — `hero.tsx` (marcação, `'use client'`), `hero.css` (CSS próprio do hero, importado só nele), `hero-nav.tsx`, `hero-hud.tsx`, `cidades-bloco.tsx`.
  - `components/hero/motion/` — `nuvens.ts` (monta e posiciona), `palco.ts` (cursor + saída, por quadro), `entrada.ts` (GSAP), `hud.ts` (contagem/relógio), `nav-scroll.ts`, `grao.ts`.
  - `lib/hero-data.ts` — tamanhos e layouts das nuvens (desktop/celular) e os números de exemplo do HUD.
  - `public/img/` — `ilha.webp`, `nuvem-1…7.webp`.
- Tokens do hero como variáveis CSS escopadas em `.hero` (não mexa em `:root` nem em `tailwind.config.ts`, para não afetar as outras páginas).
- Cada camada tem duas caixas: a de fora recebe `transform` do cursor e da saída (escrito pelo `palco.ts` só quando algo muda); a de dentro recebe a entrada (GSAP).
- Deriva e flutuação em animação CSS; pause com o hero fora da tela (`IntersectionObserver` + `animation-play-state`).
- Limpe tudo em `useEffect` (cancelar rAF, listeners, `gsap.context().revert()`), por causa do Strict Mode em dev.
- A home passa de client component único para: `page.tsx` renderizando `<Hero />` + o conteúdo atual. Se mantiver `'use client'` em `page.tsx`, ok; o ideal é mover o conteúdo atual para `components/home-content.tsx` e deixar `page.tsx` como server component.
- Importe as fontes em `hero.tsx` (não no `layout.tsx`), para só pagarem custo na home.

### Verificação
- `pnpm --filter web exec next build` sem erro; console limpo (inclusive hidratação).
- Prints headless (Playwright) em 1456×840 e 390×844: hero após a entrada (~5s), saída em 15, 30, 45, 62 e 80% (desktop) e 45% (celular), e o bloco `#cidades`, ampliando com `page.screenshot({ clip })`.
- Procure linha reta horizontal e pedacinho solto: não pode haver nenhum. Ajuste até bater com a descrição.
- Confirme que `/locais`, `/login`, `/cadastro` e `/comerciante` continuam com a navbar original e sem regressão visual.
