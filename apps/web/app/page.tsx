import Link from 'next/link';
import { BuscaHome } from '../components/busca-home';
import { Hero } from '../components/hero/hero';
import { DivisorNuvem } from '../components/hero/divisor-nuvem';
import { CidadeArte } from '../components/cidade-arte';
import '../components/hero/secoes.css';
import { buscaStats } from '../lib/guia-stats';
import { CIDADES } from '../lib/cidades';
import { ApiClient } from '../lib/api-client';
import { ESTADOS } from '@guia/contracts/brasil';
import { Utensils, Beer, Coffee, Hotel, Camera, ShoppingBag, ArrowRight } from 'lucide-react';

// a home é gerada uma vez e se renova sozinha a cada minuto; ninguém espera a API para ver a página
export const revalidate = 60;

const CATEGORIES = [
  {
    name: 'Restaurantes',
    slug: 'restaurantes',
    icon: Utensils,
    count: '150+ opções',
    glow: 'group-hover:border-orange-500/50 group-hover:shadow-[0_0_25px_rgba(249,115,22,0.25)]',
    iconBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  },
  {
    name: 'Cafés & Bistrôs',
    slug: 'cafes',
    icon: Coffee,
    count: '95+ opções',
    glow: 'group-hover:border-amber-500/50 group-hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]',
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    name: 'Bares & Pubs',
    slug: 'bares',
    icon: Beer,
    count: '80+ opções',
    glow: 'group-hover:border-blue-500/50 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]',
    iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    name: 'Hotéis & Pousadas',
    slug: 'hospedagem',
    icon: Hotel,
    count: '60+ opções',
    glow: 'group-hover:border-emerald-500/50 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    name: 'Pontos Turísticos',
    slug: 'turismo',
    icon: Camera,
    count: '110+ atrações',
    glow: 'group-hover:border-purple-500/50 group-hover:shadow-[0_0_25px_rgba(242,166,90,0.25)]',
    iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  {
    name: 'Comércio Local',
    slug: 'comercio',
    icon: ShoppingBag,
    count: '200+ lojas',
    glow: 'group-hover:border-rose-500/50 group-hover:shadow-[0_0_25px_rgba(244,63,94,0.25)]',
    iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
];


export default async function HomePage() {
  const [stats, comLugares, estadosComLugares] = await Promise.all([
    buscaStats(),
    ApiClient.getCities(undefined, { limit: 40 }),
    ApiClient.getStates(),
  ]);
  const porCidade: Record<string, number> = Object.fromEntries(comLugares.map((c) => [c.city, c.count]));
  const porEstado = new Map(estadosComLugares.map((e) => [e.uf, e.count]));

  return (
    <div className="bg-[#0b0a17] text-slate-100 overflow-x-clip">
      <Hero stats={stats} />

      <div className="hero-depois space-y-16 pb-24">
      {/* Busca por cidade: o antigo hero, agora logo depois da ilha */}
      <section id="cidades" className="max-w-5xl mx-auto px-4 scroll-mt-24 space-y-10 relative">
        <div className="space-y-4">
          <p className="hero-mono text-xs tracking-wide text-purple-300">[ para onde você vai ]</p>
          <h2 className="hero-titulo text-3xl sm:text-5xl tracking-[-0.045em] leading-[1.05] text-white">
            Escolha a cidade,<br />
            a gente mostra o que está aberto.
          </h2>
        </div>

        <BuscaHome />

        <dl className="grid grid-cols-2 md:grid-cols-6 border-y border-white/[0.1] divide-x divide-white/[0.1]">
          {[
            ['Locais', String(stats.lugares)],
            ['Cidades', String(stats.cidades)],
            ['Categorias', String(CATEGORIES.length)],
            ['Avaliações', String(stats.avaliacoes)],
            ['Nota média', String(stats.nota).replace('.', ',')],
            ['Rota', 'Google Maps'],
          ].map(([rotulo, valor]) => (
            <div key={rotulo} className="px-4 py-5 space-y-1.5 border-t border-white/[0.1] first:border-t-0 md:border-t-0">
              <dt className="hero-mono text-[11px] tracking-wide text-slate-400">{rotulo}</dt>
              <dd className="text-lg sm:text-xl font-medium tracking-tight text-white tabular-nums">{valor}</dd>
            </div>
          ))}
        </dl>
      </section>

      <DivisorNuvem src="nuvem-6" />

      {/* Categorias */}
      <section id="destaques" className="max-w-7xl mx-auto px-4 scroll-mt-24 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div className="space-y-4">
            <p className="hero-mono text-xs tracking-wide text-purple-300">[ o que você procura ]</p>
            <h2 className="hero-titulo text-3xl sm:text-5xl tracking-[-0.045em] leading-[1.05] text-[#faf6ee]">
              Seis jeitos de aproveitar<br />o lugar onde você está.
            </h2>
          </div>
          <Link href="/locais" className="botao-pilula self-start sm:self-auto">
            <span>Ver todos os locais</span>
            <span className="botao-pilula__circulo" aria-hidden="true">
              <ArrowRight />
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <Link key={cat.slug} href={`/locais?categoria=${cat.slug}`} className="categoria-tile group">
                <div className="flex items-start justify-between">
                  <span className="hero-mono text-[11px] text-[#faf6ee]/45">{String(i + 1).padStart(2, '0')}</span>
                  <span className="categoria-tile__icone">
                    <Icon className="w-5 h-5" />
                  </span>
                </div>
                <div>
                  <h3 className="hero-titulo text-lg leading-tight text-[#faf6ee]">{cat.name}</h3>
                  <span className="hero-mono text-[11px] text-[#f2a65a]">{cat.count}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <DivisorNuvem src="nuvem-1" espelha />

      {/* Cidades */}
      <section className="max-w-7xl mx-auto px-4 space-y-10">
        <div className="space-y-4">
          <p className="hero-mono text-xs tracking-wide text-purple-300">[ destinos ]</p>
          <h2 className="hero-titulo text-3xl sm:text-5xl tracking-[-0.045em] leading-[1.05] text-[#faf6ee]">
            Cidades para começar.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[15rem] gap-4">
          {CIDADES.map((city, i) => (
            <Link
              key={city.nome}
              href={`/cidades/${city.slug}`}
              className={`cidade-card group ${i === 0 ? 'lg:col-span-2 lg:row-span-2 min-h-[22rem]' : 'min-h-[15rem]'}`}
            >
              <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-700 ease-out">
                <CidadeArte slug={city.slug} />
              </div>
              <div className="cidade-card__veu" />
              <div className="relative z-10 h-full flex flex-col justify-between p-5 sm:p-6">
                <div className="flex items-start justify-between gap-2">
                  <span className="hero-mono text-[11px] text-[#faf6ee] bg-[#0b0a17]/55 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                    {city.tag}
                  </span>
                  {porCidade[city.nome] > 0 && (
                    <span className="hero-mono text-[11px] text-[#0b0a17] bg-[#faf6ee] px-3 py-1 rounded-full">
                      {porCidade[city.nome]} {porCidade[city.nome] === 1 ? 'lugar' : 'lugares'}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className={`hero-titulo text-[#faf6ee] leading-none ${i === 0 ? 'text-4xl sm:text-5xl' : 'text-2xl'}`}>
                    {city.nome}
                    <span className="hero-mono text-xs text-[#f2a65a] ml-2 align-middle">{city.uf}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[#faf6ee]/75">{city.subtitulo}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Todos os estados */}
      <section className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div className="space-y-4">
            <p className="hero-mono text-xs tracking-wide text-purple-300">[ o Brasil inteiro ]</p>
            <h2 className="hero-titulo text-3xl sm:text-5xl tracking-[-0.045em] leading-[1.05] text-[#faf6ee]">
              Os 27 estados,<br />mais de 5 mil cidades.
            </h2>
          </div>
          <Link href="/estados" className="botao-pilula self-start sm:self-auto">
            <span>Explorar por estado</span>
            <span className="botao-pilula__circulo" aria-hidden="true">
              <ArrowRight />
            </span>
          </Link>
        </div>

        <ul className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {ESTADOS.map((e) => {
            const n = porEstado.get(e.uf) ?? 0;
            return (
              <li key={e.uf}>
                <Link
                  href={`/estados/${e.slug}`}
                  title={e.nome}
                  className={`flex items-baseline justify-between gap-2 rounded-2xl border px-3.5 py-3 transition hover:border-[#f2a65a]/70 hover:bg-white/[0.06] ${
                    n ? 'border-white/[0.18] bg-white/[0.04]' : 'border-white/[0.08]'
                  }`}
                >
                  <span className="hero-titulo text-lg text-[#faf6ee]">{e.uf}</span>
                  <span className={`hero-mono text-[11px] ${n ? 'text-[#f2a65a]' : 'text-slate-500'}`}>{n || '—'}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Para comerciantes */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="cta-ceu">
          <img className="cta-ceu__nuvem cta-ceu__nuvem--a" src="/img/nuvem-6.webp" alt="" loading="lazy" decoding="async" />
          <img className="cta-ceu__nuvem cta-ceu__nuvem--b" src="/img/nuvem-1.webp" alt="" loading="lazy" decoding="async" />
          <div className="relative z-10 max-w-2xl space-y-6">
            <p className="hero-mono text-xs tracking-wide text-[#faf6ee]/80">[ para comerciantes ]</p>
            <h2 className="hero-titulo text-3xl sm:text-5xl tracking-[-0.045em] leading-[1.05] text-[#faf6ee]">
              Coloque seu negócio no mapa e apareça para quem está por perto.
            </h2>
            <p className="text-sm sm:text-base text-[#faf6ee]/80 leading-relaxed max-w-xl">
              Cadastre seu estabelecimento, receba avaliações de quem foi e responda cada uma. A rota no Google Maps
              vai junto, sem taxa por venda.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-5">
              <Link href="/comerciante" className="botao-pilula">
                <span>Cadastrar meu estabelecimento</span>
                <span className="botao-pilula__circulo" aria-hidden="true">
                  <ArrowRight />
                </span>
              </Link>
              <Link
                href="/locais"
                className="text-sm text-[#faf6ee] underline underline-offset-[5px] decoration-[#faf6ee]/50 hover:decoration-[#faf6ee]"
              >
                Ver como fica na prática
              </Link>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
