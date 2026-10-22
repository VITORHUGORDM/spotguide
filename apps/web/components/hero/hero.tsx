'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/ibm-plex-mono/400.css';
import './hero.css';

import { IlhaSvg } from './ilha-svg';
import { MURO, NUVENS, CHIPS } from '../../lib/hero-data';
import { Utensils, Coffee, Beer, Hotel, Camera, ShoppingBag } from 'lucide-react';
import type { GuiaStats } from '../../lib/guia-stats';
import { estiloNuvem, nuvensDa } from './motion/nuvens';
import { iniciarPalco } from './motion/palco';
// só os tipos: o código do hud/entrada usa o GSAP e é carregado depois do primeiro desenho da página
import type { ElsHud } from './motion/hud';

const NOME = 'SpotGuide'.split('');

const ICONES = { utensils: Utensils, coffee: Coffee, beer: Beer, hotel: Hotel, camera: Camera, shopping: ShoppingBag };

function Balao() {
  return (
    <div className="balao" aria-hidden="true">
      <svg viewBox="0 0 60 84">
        <path d="M30 2C13 2 4 16 4 28c0 14 12 26 20 32h12c8-6 20-18 20-32C56 16 47 2 30 2Z" fill="#d9484a" />
        <path d="M30 2C21 8 17 18 17 30c0 12 5 22 9 30h8c4-8 9-18 9-30C43 18 39 8 30 2Z" fill="#faf6ee" />
        <path d="M30 2C26 10 25 20 25 30c0 12 2 22 3 30h4c1-8 3-18 3-30C35 20 34 10 30 2Z" fill="#f2a65a" />
        <path d="M24 60h12l-2 6h-8zM26 66l-3 10M34 66l3 10" stroke="#3b2a78" strokeWidth="1.4" fill="none" />
        <rect x="23" y="76" width="14" height="8" rx="1.5" fill="#8d5b34" />
      </svg>
    </div>
  );
}

function Nuvens({ camada }: { camada: 'longe' | 'horizonte' | 'frente' }) {
  return (
    <>
      {nuvensDa(NUVENS, camada).map((n, i) => (
        <div key={i} className={`nuvem${n.oculta ? ' nuvem--so-desktop' : ''}`} style={estiloNuvem(n)}>
          <img
            src={`/img/${n.src}.webp`}
            alt=""
            draggable={false}
            style={n.espelha ? { transform: 'scaleX(-1)' } : undefined}
          />
        </div>
      ))}
    </>
  );
}

function Pin() {
  return (
    <svg className="hero__pin" viewBox="0 0 24 32" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 0C5.4 0 0 5.3 0 11.8 0 20.5 12 32 12 32s12-11.5 12-20.2C24 5.3 18.6 0 12 0Zm0 7.2a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2Z"
      />
    </svg>
  );
}

export function Hero({ stats }: { stats: GuiaStats }) {
  const ref = useRef<HTMLElement>(null);
  const router = useRouter();
  const hora = useRef<HTMLSpanElement>(null);
  const lugares = useRef<HTMLSpanElement>(null);
  const nota = useRef<HTMLSpanElement>(null);
  const avaliacoes = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const hero = ref.current;
    if (!hero || !hora.current || !lugares.current || !nota.current || !avaliacoes.current) return;

    const els: ElsHud = {
      hora: hora.current,
      lugares: lugares.current,
      nota: nota.current,
      avaliacoes: avaliacoes.current,
    };
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const limpezas: Array<() => void> = [iniciarPalco(hero)];
    let cancelado = false;

    // O GSAP (e o código que o usa) vem num pedaço separado: o texto e a ilha já aparecem sem esperar por ele.
    // Os números do HUD chegam prontos do servidor; nada aqui espera pela API.
    Promise.all([import('./motion/hud'), import('./motion/entrada')]).then(async ([hud, entrada]) => {
      if (cancelado) return;

      if (reduzido) {
        hero.dataset.entrada = 'feita';
        hud.pintaHud(els, stats);
        limpezas.push(hud.iniciarHudVivo(els));
        return;
      }

      await entrada.aguardaRecursos(hero);
      if (cancelado) return;
      const tl = entrada.criarEntrada(hero, els, stats);
      tl.eventCallback('onComplete', () => {
        hero.dataset.entrada = 'feita';
        limpezas.push(hud.iniciarHudVivo(els));
      });
      limpezas.push(() => tl.kill());
    });

    return () => {
      cancelado = true;
      limpezas.forEach((l) => l());
    };
  }, [stats]);

  // clique simples abre o portal; ctrl/cmd/shift/botão do meio seguem o link normal
  const portal = (href: string) => (e: React.MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || !ref.current) return;
    e.preventDefault();
    import('./motion/portal').then((m) => m.abrirPortal(ref.current!, href, router.push));
  };

  return (
    <section ref={ref} id="topo" className="hero" data-entrada="pendente" data-visivel="true">
      <div className="hero__stage">
        {/* 1. Céu */}
        <div className="camada" data-camada="ceu" data-prof="0.05" data-sobe="0.06">
          <div className="camada__in" data-in="ceu">
            <div className="ceu" />
            <div className="ceu__sol" />
            <div className="ceu__clarao" />
            <svg className="serra" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
              <path
                fill="#7a5a8c"
                d="M0 220V150l70-34 80 22 90-52 70 30 100-60 90 48 80-26 110 62 90-40 100 38 80-70 90 56 100-34 110 52 100-30 110 44 70-24V220Z"
              />
            </svg>
          </div>
        </div>

        {/* 2. Nuvens de longe */}
        <div className="camada camada--longe" data-camada="longe" data-prof="0.18" data-sobe="0.16">
          <div className="camada__in" data-in="longe">
            <Balao />
            <Nuvens camada="longe" />
          </div>
        </div>

        {/* 3. Mar de nuvens do horizonte */}
        <div className="camada camada--horizonte" data-camada="horizonte" data-prof="0.34" data-sobe="0.32">
          <div className="camada__in" data-in="horizonte">
            <div className="nevoa" style={{ top: '77%' }} />
            <Nuvens camada="horizonte" />
          </div>
        </div>

        {/* 4. A ilha */}
        <div className="camada camada--ilha" data-camada="ilha" data-prof="0.58" data-sobe="0.6" data-escala="0.86">
          <div className="camada__in" data-in="ilha">
            <div className="ilha-box" onClick={portal('/locais')}>
              <div className="ilha-float">
                <div className="ilha-nevoa" />
                <IlhaSvg />
              </div>
            </div>
          </div>
        </div>

        {/* Categorias orbitando a ilha */}
        <div className="camada camada--chips" data-camada="chips" data-prof="0.8" data-sobe="0.45">
          <div className="camada__in">
            {CHIPS.map((c) => {
              const Icone = ICONES[c.icone];
              return (
                <Link
                  key={c.slug}
                  href={`/locais?categoria=${c.slug}`}
                  className="chip"
                  data-in="fade"
                  style={c.pos}
                >
                  <span className="chip__in" style={{ animationDelay: `${c.atraso}s` }}>
                    <Icone className="chip__icone" aria-hidden="true" />
                    <span>{c.nome}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 5. Nuvens da frente */}
        <div className="camada camada--frente" data-camada="frente" data-prof="1" data-sobe="1.25" data-escala="1.38">
          <div className="camada__in" data-in="frente">
            <div className="nevoa" style={{ top: '91%' }} />
            <Nuvens camada="frente" />
          </div>
        </div>

        {/* 6. Sombra de nuvem (parada) */}
        <div className="sombra" aria-hidden="true" />

        {/* Muro de nuvens da saída */}
        <div className="muro" aria-hidden="true">
          {MURO.map((fila, i) => (
            <div key={i} className="muro__fila" data-muro={[2.0, 2.35, 2.75][i]} style={{ top: `${100 + i * 9}%` }}>
              <div className="muro__nevoa" />
              {fila.map((n, j) => (
                <img
                  key={j}
                  src={`/img/${n.src}.webp`}
                  alt=""
                  draggable={false}
                  style={{
                    left: `${n.x}vw`,
                    top: `${n.dy ?? 0}svh`,
                    width: `${n.w}vw`,
                    transform: n.espelha ? 'scaleX(-1)' : undefined,
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* 7. Texto e interface */}
        <div className="hero__ui">
          <div className="hero__hud" data-saida="hud">
            <div className="hero__hud-esq" data-in="fade">
              <span>
                <span ref={hora}>18:40</span> · Brasil · 29°22′S
              </span>
              <span>
                Lugares no guia: <span ref={lugares}>{stats.lugares}</span>
              </span>
            </div>
            <div className="hero__hud-dir" data-in="fade">
              Nota média <span ref={nota}>{String(stats.nota).replace('.', ',')}</span> ·{' '}
              <span ref={avaliacoes}>{stats.avaliacoes}</span> avaliações
            </div>
            <a href="#cidades" className="hero__dica" data-in="fade">
              [ role para ver as cidades ]
            </a>
          </div>

          <div className="hero__texto" data-saida="texto">
            <h1 className="hero__nome" aria-label="SpotGuide">
              <span aria-hidden="true" className="hero__letras">
                {NOME.map((l, i) => (
                  <span key={i} className="hero__mask">
                    <span className="hero__letra">{l}</span>
                  </span>
                ))}
              </span>
              <span className="hero__pin-box" data-in="pin" aria-hidden="true">
                <Pin />
              </span>
            </h1>

            <div className="hero__lado">
              <p className="hero__para">
                {[
                  'Restaurantes, bares, hotéis e',
                  'pontos turísticos perto de você,',
                  'com rota e nota de quem foi.',
                ].map((t) => (
                  <span key={t} className="hero__linha">
                    <span className="hero__linha-in">{t}</span>
                  </span>
                ))}
              </p>
              <div className="hero__acoes" data-in="fade">
                <Link href="/locais" className="botao-pilula" onClick={portal('/locais')}>
                  <span>Explorar locais</span>
                  <span className="botao-pilula__circulo" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </Link>
                <Link href="/comerciante" className="hero__link">
                  Sou comerciante
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Véu escuro da saída e névoa da entrada */}
        <div className="veu" data-saida="veu" aria-hidden="true" />
        <div className="veu-entrada" data-entrada-veu aria-hidden="true" />
      </div>
    </section>
  );
}
