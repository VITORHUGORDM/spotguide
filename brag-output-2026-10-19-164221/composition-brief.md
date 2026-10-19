# Hyperframes Composition Brief: SpotGuide

## Objective
Create a short launch-style brag video for SpotGuide.

## Output
- Composition directory: `brag-output-2026-10-19-164221/composition/`
- Rendered video: `brag-output-2026-10-19-164221/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 22 s

## Source Material
- Project root: C:\Users\Vitor Hugo\spotguide
- Primary files read: apps/web/app/page.tsx, components/hero/*, components/cidade-arte.tsx, lib/cidades.ts, app/cidades/[slug]/page.tsx, components/mapa-locais.tsx, components/photo-manager.tsx
- Product name: SpotGuide
- Tagline / strongest claim: "Restaurantes, bares, hotéis e pontos turísticos perto de você, com rota e nota de quem foi."
- Key UI moments (real screenshots in `assets/shots/`, captured at 1920x1080 from the running site): hero.png, nuvens.png, cidades.png, cidade.png, mapa.png, lista.png, fotos.png
- Copy that must appear verbatim:
  - "Restaurantes, bares, hotéis e pontos turísticos perto de você, com rota e nota de quem foi."
  - "Perto de mim" / "Mostrar só lugares num raio de 25 km" (como "Perto de mim · 25 km")
  - "A primeira foto vira a capa" (como "a primeira vira capa")

## Creative Direction
- Tone preset: cinematic
- Creative direction: trailer curto, corte seco no beat, tela real do produto
- Interpretation: cortes duros nas batidas fortes, texto curto que segura o tempo de leitura, nada de mockup.
- Angle: O guia que parece um lugar: abre numa ilha flutuante e desce até o mapa.
- Hook: "E se o guia turístico / fosse uma ilha?" em tela escura; corte para a ilha em 2,88 s.
- Outro / punchline: wordmark SpotGuide + frase do site.
- Avoid: linguagem genérica de SaaS; filler abstrato; redesenhar o visual do produto.

## Visual Identity
- Background: #0b0a17
- Text: #faf6ee
- Accent: #f2a65a (apoio #d9697a, #3b2a78)
- Display font: Archivo (assets/fonts/archivo.woff2)
- Body font: IBM Plex Mono (assets/fonts/plex-mono.woff2)
- Visual references from the project: hero com a ilha, degradê do céu, chips de categoria, pin de mapa

## Storyboard
Use the storyboard in `brag-plan.md` as the creative contract.

## Audio
- Audio role: dense rhythmic layer + sparse SFX
- Music: assets/music/we-on-go.mp3 (trecho de 23 s de "BIA - WE ON GO", arquivo do usuário)
- Music treatment: volume 0,8, fade-in 0,25 s, fade-out nos últimos 1,8 s (já aplicado no arquivo)
- Music cue guidance: `beats/assets/music/we-on-go.mp3.json` (hyperframes beats, 131 BPM). Strong beats: 2.88, 5.17, 7.46, 10.20, 13.87, 15.69.
- Audio-reactive treatment: sutil; `assets/rms.js` (RMS por quadro, 30 fps) modula o brilho coral e a vinheta.
- SFX: impactSoft_medium_001 (slam 2.8s), drop_001/drop_002 (cortes e linhas de números), click1 (mapa), impactBell_heavy_000 (wordmark 19.75s)
- Audio files: copiados para `composition/assets/`

## Hyperframes Instructions
Composition built following the native Hyperframes conventions (data-* timing, window.__timelines, seek-safe GSAP). Run `npx hyperframes check` before render.
