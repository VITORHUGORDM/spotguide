'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CityAutocomplete } from '../components/city-autocomplete';
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
    glow: 'group-hover:border-purple-500/50 group-hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]',
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('busca', search.trim());
    if (city.trim()) params.set('cidade', city.trim());
    router.push(`/locais?${params.toString()}`);
  };

  return (
    <div className="space-y-24 pb-24 overflow-hidden bg-[#030305] text-slate-100">
      {/* Hero Section Dark Luxury (Estilo do vídeo: fundo cósmico, bioluminescência roxa, tipografia imersiva) */}
      <section className="relative pt-16 sm:pt-24 pb-28 px-4 overflow-hidden">
        {/* Glowing Cosmic Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-gradient-to-tr from-purple-600/25 via-indigo-600/20 to-cyan-500/15 blur-[120px] -z-10 rounded-full pointer-events-none animate-cosmic-glow" />
        <div className="absolute top-10 left-10 w-96 h-96 bg-purple-900/15 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-900/15 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-10 relative z-10">
          {/* Futuristic Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] shadow-[0_0_20px_rgba(168,85,247,0.2)] backdrop-blur-2xl text-[11px] font-bold tracking-[0.2em] uppercase text-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping shadow-[0_0_8px_#a855f7]" />
            <span>A Nova Era do Turismo & Comércio</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>

          {/* Cinematic Headline */}
          <div className="space-y-5">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-white">
              Explore o{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(168,85,247,0.4)]">
                Extraordinário
              </span>
              .<br className="hidden sm:inline" />
              Na sua Cidade e pelo Brasil.
            </h1>
            <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
              O guia inteligente com geolocalização precisa, rotas com 1 clique no Google Maps e estabelecimentos 100% verificados.
            </p>
          </div>

          {/* Super Search Capsule Dark Luxury com Autocomplete de Cidades em tempo real */}
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-[#0b0b14]/85 backdrop-blur-2xl p-2.5 sm:p-3 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/[0.12] ring-1 ring-purple-500/20 flex flex-col md:flex-row items-center gap-2 hover:border-purple-500/40 transition-all duration-300"
            >
              {/* Keyword Input */}
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

              {/* City Autocomplete com live suggestions em tempo real */}
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

              {/* Submit CTA com Gradiente Cósmico */}
              <button
                type="submit"
                className="w-full md:w-auto px-7 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] flex items-center justify-center gap-2 group flex-shrink-0 hover:scale-[1.02]"
              >
                <span>Explorar</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          {/* Social Proof Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Verificados</span>
            </div>
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span>Traçado GPS em 1 Clique</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Avaliações Reais de Visitantes</span>
            </div>
          </div>

          {/* Smooth Scroll Down Animation Indicator (Exato estilo do vídeo do YouTube) */}
          <div className="pt-8">
            <a
              href="#destaques"
              className="inline-flex flex-col items-center gap-2.5 group text-xs font-semibold text-slate-500 hover:text-purple-400 transition"
            >
              <span className="tracking-[0.2em] uppercase text-[10px] text-slate-400 group-hover:text-purple-300 transition">
                Role para explorar
              </span>
              <div className="w-6 h-10 rounded-full border-2 border-white/20 group-hover:border-purple-500/80 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] flex justify-center p-1.5 transition">
                <div className="w-1.5 h-2.5 bg-purple-400 rounded-full animate-scroll-wheel shadow-[0_0_8px_#a855f7]" />
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Categorias em Destaque Dark Luxury */}
      <section id="destaques" className="max-w-7xl mx-auto px-4 scroll-mt-24 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400 bg-purple-500/10 px-3.5 py-1.5 rounded-full border border-purple-500/20">
              Categorias Selecionadas
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-3">
              O que você deseja vivenciar?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Escolha uma categoria para navegar pelos melhores estabelecimentos.
            </p>
          </div>

          <Link
            href="/locais"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-purple-400 hover:text-purple-300 group"
          >
            Ver catálogo completo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/locais?categoria=${cat.slug}`}
                className={`group relative p-6 bg-[#0a0a12]/80 border border-white/[0.08] rounded-3xl shadow-lg hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center gap-3 overflow-hidden ${cat.glow}`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${cat.iconBg} border group-hover:scale-110 flex items-center justify-center transition-transform duration-300 shadow-sm`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-purple-300 transition">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">{cat.count}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Cidades e Destinos Populares (Estilo Bento Grid Dark) */}
      <section className="max-w-7xl mx-auto px-4 space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 bg-cyan-500/10 px-3.5 py-1.5 rounded-full border border-cyan-500/20">
            Destinos Mais Cobiçados
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-3">
            Cidades que encantam viajantes de todo o Brasil
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Destinos com alta gastronomia, lazer e atrações imperdíveis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {POPULAR_CITIES.map((city) => (
            <Link
              key={city.name}
              href={`/locais?cidade=${encodeURIComponent(city.name)}`}
              className="group relative h-84 rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl hover:border-purple-500/50 hover:shadow-[0_0_35px_rgba(168,85,247,0.25)] transition-all duration-500"
            >
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-between p-6 text-white">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-purple-300">
                    {city.tag}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-purple-600/60 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black tracking-tight text-white">{city.name}</h3>
                    <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold px-2 py-0.5 rounded-md">
                      {city.state}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{city.subtitle}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Banner Especial para Comerciantes Dark Futuristic */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#0b0b14] via-[#120d24] to-[#0d1326] border border-white/[0.1] text-white p-8 sm:p-14 overflow-hidden shadow-2xl">
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-[0.2em]">
              Para Comerciantes & Empreendedores
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Coloque seu negócio no mapa do futuro e atraia mais clientes todos os dias.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              O SpotGuide é a plataforma definitiva para comerciantes que querem visibilidade direta,
              rotas no Google Maps e avaliações autênticas sem pagar taxas abusivas por venda.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/comerciante"
                className="px-7 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-[0_0_25px_rgba(168,85,247,0.4)] flex items-center gap-2 hover:scale-[1.02]"
              >
                <Building2 className="w-4 h-4" />
                Cadastrar Meu Estabelecimento
              </Link>
              <Link
                href="/locais"
                className="px-7 py-3.5 bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold text-xs sm:text-sm rounded-xl transition border border-white/[0.1]"
              >
                Ver Como Fica na Prática
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
