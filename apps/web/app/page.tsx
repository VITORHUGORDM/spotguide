'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CityAutocomplete } from '../components/city-autocomplete';
import { Hero } from '../components/hero/hero';
import { DivisorNuvem } from '../components/hero/divisor-nuvem';
import { CidadeArte, slugCidade } from '../components/cidade-arte';
import '../components/hero/secoes.css';
import { carregaStats, type GuiaStats } from '../lib/guia-stats';
import { ApiClient } from '../lib/api-client';
import {
  Search,
  MapPin,
  Utensils,
  Beer,
  Coffee,
  Hotel,
  Camera,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Navigation,
  Star,
  Building2,
  Compass,
} from 'lucide-react';

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

const POPULAR_CITIES = [
  {
    name: 'Gramado',
    state: 'RS',
    subtitle: 'Serra Gaúcha • Alta Gastronomia & Charme',
    image: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=800&q=80',
    tag: 'Mais Procurado',
  },
  {
    name: 'Campos do Jordão',
    state: 'SP',
    subtitle: 'Clima Europeu • Vinhos & Fondue',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    tag: 'Inverno & Luxo',
  },
  {
    name: 'Florianópolis',
    state: 'SC',
    subtitle: 'Ilha da Magia • Praias & Frutos do Mar',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    tag: 'Litoral & Agito',
  },
  {
    name: 'Rio de Janeiro',
    state: 'RJ',
    subtitle: 'Cidade Maravilhosa • Cultura & Paisagens',
    image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80',
    tag: 'Cartão Postal',
  },
  {
    name: 'Porto Alegre',
    state: 'RS',
    subtitle: 'Orla do Guaíba • Gastronomia & Parques',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    tag: 'Capital Sulista',
  },
  {
    name: 'Curitiba',
    state: 'PR',
    subtitle: 'Cidade Modelo • Parques & Alta Gastronomia',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    tag: 'Inovação & Café',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [stats, setStats] = useState<GuiaStats | null>(null);
  const [porCidade, setPorCidade] = useState<Record<string, number>>({});

  useEffect(() => {
    carregaStats().then(setStats);
    ApiClient.getCities().then((lista) => setPorCidade(Object.fromEntries(lista.map((c) => [c.city, c.count]))));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('busca', search.trim());
    if (city.trim()) params.set('cidade', city.trim());
    router.push(`/locais?${params.toString()}`);
  };

  return (
    <div className="bg-[#0b0a17] text-slate-100 overflow-x-clip">
      <Hero />

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

        <form
          onSubmit={handleSearchSubmit}
          className="bg-[#0b0b14]/85 backdrop-blur-2xl p-2.5 sm:p-3 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/[0.12] ring-1 ring-purple-500/20 flex flex-col md:flex-row items-center gap-2 hover:border-purple-500/40 transition-all duration-300"
        >
          <div className="flex-1 w-full flex items-center px-4 py-3 gap-3 bg-white/[0.03] hover:bg-white/[0.05] focus-within:bg-white/[0.06] rounded-2xl border border-white/[0.05] focus-within:border-purple-500/50 transition">
            <Search className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="O que você procura? (ex: café colonial, pizza, pousada...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs sm:text-sm bg-transparent outline-none text-white placeholder-slate-500 font-medium"
            />
          </div>

          <div className="w-full md:w-72 flex items-center px-4 py-3 gap-2.5 bg-white/[0.03] hover:bg-white/[0.05] focus-within:bg-white/[0.06] rounded-2xl border border-white/[0.05] focus-within:border-indigo-500/50 transition">
            <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <CityAutocomplete
              value={city}
              onChange={(val) => setCity(val)}
              placeholder="Digite a cidade..."
              className="w-full"
              inputClassName="font-medium text-xs sm:text-sm text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-7 py-3.5 bg-[#faf6ee] hover:bg-white text-[#0b0a17] font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-[0_0_25px_rgba(242,166,90,0.4)] hover:shadow-[0_0_35px_rgba(242,166,90,0.6)] flex items-center justify-center gap-2 group flex-shrink-0 hover:scale-[1.02]"
          >
            <span>Explorar</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <dl className="grid grid-cols-2 md:grid-cols-6 border-y border-white/[0.1] divide-x divide-white/[0.1]">
          {[
            ['Locais', stats ? String(stats.lugares) : '—'],
            ['Cidades', stats ? String(stats.cidades) : '—'],
            ['Categorias', String(CATEGORIES.length)],
            ['Avaliações', stats ? String(stats.avaliacoes) : '—'],
            ['Nota média', stats ? String(stats.nota).replace('.', ',') : '—'],
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
          {POPULAR_CITIES.map((city, i) => (
            <Link
              key={city.name}
              href={`/locais?cidade=${encodeURIComponent(city.name)}`}
              className={`cidade-card group ${i === 0 ? 'lg:col-span-2 lg:row-span-2 min-h-[22rem]' : 'min-h-[15rem]'}`}
            >
              <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-700 ease-out">
                <CidadeArte slug={slugCidade(city.name)} />
              </div>
              <div className="cidade-card__veu" />
              <div className="relative z-10 h-full flex flex-col justify-between p-5 sm:p-6">
                <div className="flex items-start justify-between gap-2">
                  <span className="hero-mono text-[11px] text-[#faf6ee] bg-[#0b0a17]/55 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                    {city.tag}
                  </span>
                  {porCidade[city.name] > 0 && (
                    <span className="hero-mono text-[11px] text-[#0b0a17] bg-[#faf6ee] px-3 py-1 rounded-full">
                      {porCidade[city.name]} {porCidade[city.name] === 1 ? 'lugar' : 'lugares'}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className={`hero-titulo text-[#faf6ee] leading-none ${i === 0 ? 'text-4xl sm:text-5xl' : 'text-2xl'}`}>
                    {city.name}
                    <span className="hero-mono text-xs text-[#f2a65a] ml-2 align-middle">{city.state}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[#faf6ee]/75">{city.subtitle}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Para comerciantes */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="cta-ceu">
          <img className="cta-ceu__nuvem cta-ceu__nuvem--a" src="/img/nuvem-6.webp" alt="" />
          <img className="cta-ceu__nuvem cta-ceu__nuvem--b" src="/img/nuvem-1.webp" alt="" />
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
