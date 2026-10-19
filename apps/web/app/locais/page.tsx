'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlaceListItem, CategoryResponse } from '@guia/contracts';
import { ApiClient } from '../../lib/api-client';
import { CityAutocomplete } from '../../components/city-autocomplete';
import {
  Search,
  MapPin,
  Star,
  Filter,
  Sparkles,
  Navigation,
  RotateCcw,
} from 'lucide-react';

function LocaisContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [places, setPlaces] = useState<PlaceListItem[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('busca') || '');
  const [city, setCity] = useState(searchParams.get('cidade') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria') || '');
  const [minRating, setMinRating] = useState<number | undefined>(
    searchParams.get('avaliacao') ? Number(searchParams.get('avaliacao')) : undefined
  );

  useEffect(() => {
    ApiClient.getCategories()
      .then((cats) => setCategories(cats))
      .catch((err) => console.error('Erro ao carregar categorias:', err));
  }, []);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.searchPlaces({
        city: city.trim() || undefined,
        categorySlug: selectedCategory || undefined,
        search: search.trim() || undefined,
        minRating: minRating,
      });
      setPlaces(data);
    } catch (err) {
      console.error('Erro ao buscar locais:', err);
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [selectedCategory, minRating]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('busca', search.trim());
    if (city.trim()) params.set('cidade', city.trim());
    if (selectedCategory) params.set('categoria', selectedCategory);
    if (minRating) params.set('avaliacao', String(minRating));
    router.push(`/locais?${params.toString()}`);
    fetchPlaces();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCity('');
    setSelectedCategory('');
    setMinRating(undefined);
    router.push('/locais');
    setTimeout(fetchPlaces, 0);
  };

  const hasActiveFilters = Boolean(search || city || selectedCategory || minRating);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 bg-[#0b0a17] text-slate-100 min-h-screen">
      {/* Page Title & Breadcrumb */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Link href="/" className="hover:text-purple-400 transition">
            Início
          </Link>
          <span>/</span>
          <span className="text-white font-semibold">Explorar Estabelecimentos</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Onde você quer ir hoje?
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Filtre por cidade com autocomplete em tempo real, categoria ou avaliação.
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.05] hover:bg-red-500/20 border border-white/[0.1] hover:border-red-500/30 rounded-xl transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-400" />
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Toolbar Dark Luxury */}
      <div className="bg-[#0b0b14]/90 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl border border-white/[0.1] shadow-2xl shadow-purple-950/40 space-y-5">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-5 flex items-center px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl focus-within:border-purple-500/60 focus-within:bg-white/[0.06] transition">
            <Search className="w-4 h-4 text-purple-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Nome do local, comida ou serviço..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent w-full text-xs sm:text-sm outline-none text-white placeholder-slate-500 font-medium"
            />
          </div>

          {/* Live City Autocomplete Search */}
          <div className="md:col-span-4 flex items-center px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl focus-within:border-cyan-500/60 focus-within:bg-white/[0.06] transition">
            <MapPin className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0" />
            <CityAutocomplete
              value={city}
              onChange={(val) => setCity(val)}
              onSelect={(selectedCity) => {
                setCity(selectedCity);
                setTimeout(fetchPlaces, 50);
              }}
              placeholder="Digite a cidade..."
              className="w-full"
              inputClassName="font-medium text-xs sm:text-sm text-white"
            />
          </div>

          {/* Action Button */}
          <div className="md:col-span-3 flex gap-2">
            <button
              type="submit"
              className="w-full bg-[#faf6ee] hover:bg-white text-[#0b0a17] font-extrabold text-xs sm:text-sm py-3 px-5 rounded-2xl transition shadow-[0_0_20px_rgba(242,166,90,0.35)] flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Filtrar Locais
            </button>
          </div>
        </form>

        {/* Secondary Filters: Categories & Ratings */}
        <div className="pt-3 border-t border-white/[0.06] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Categories Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
            <span className="text-[10px] font-bold text-purple-300/70 uppercase tracking-[0.15em] flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              Categorias:
            </span>
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === ''
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(242,166,90,0.5)]'
                  : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/[0.05]'
              }`}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.slug ? '' : cat.slug)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === cat.slug
                    ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(242,166,90,0.5)]'
                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/[0.05]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Minimum Rating Filter */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
              Avaliação:
            </span>
            {[undefined, 4.0, 4.5].map((val) => (
              <button
                key={String(val)}
                onClick={() => setMinRating(minRating === val ? undefined : val)}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                  minRating === val
                    ? 'bg-amber-500 text-slate-900 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.05]'
                }`}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>{val ? `${val}+` : 'Qualquer'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>{loading ? 'Buscando estabelecimentos...' : `${places.length} locais encontrados`}</span>
          {city && (
            <span className="text-xs font-semibold text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 rounded-md">
              em {city}
            </span>
          )}
        </h2>
        {selectedCategory && (
          <span className="text-xs bg-purple-500/15 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-full font-bold">
            {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
          </span>
        )}
      </div>

      {/* Places Cards Grid Dark Luxury */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-[#0a0a14] rounded-3xl border border-white/[0.06] p-4 animate-pulse space-y-4"
            >
              <div className="h-56 bg-white/[0.04] rounded-2xl" />
              <div className="h-4 bg-white/[0.04] rounded w-3/4" />
              <div className="h-3 bg-white/[0.04] rounded w-1/2" />
              <div className="h-9 bg-white/[0.04] rounded-xl" />
            </div>
          ))}
        </div>
      ) : places.length === 0 ? (
        <div className="bg-[#0a0a14] rounded-3xl border border-white/[0.08] p-14 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto text-3xl shadow-[0_0_20px_rgba(242,166,90,0.25)]">
            🧭
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Nenhum estabelecimento encontrado</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Não encontramos resultados com os filtros atuais. Tente buscar por outra cidade no autocomplete ou limpar os filtros.
            </p>
          </div>
          <button
            onClick={handleClearFilters}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:shadow-[0_0_20px_rgba(242,166,90,0.4)] transition"
          >
            Ver Todos os Locais
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place) => (
            <Link
              key={place.id}
              href={`/locais/${place.slug}`}
              className="group bg-[#0a0a14]/90 rounded-3xl border border-white/[0.08] overflow-hidden shadow-xl hover:border-purple-500/50 hover:shadow-[0_0_35px_rgba(242,166,90,0.2)] hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Cover Image */}
                <div className="relative h-56 bg-zinc-900 overflow-hidden">
                  {place.coverPhotoUrl ? (
                    <img
                      src={place.coverPhotoUrl}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-zinc-900 text-zinc-600">
                      🏢
                    </div>
                  )}

                  {/* Category Pill */}
                  <div className="absolute top-3.5 left-3.5">
                    <span className="bg-black/75 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20 shadow-sm">
                      {place.category.name}
                    </span>
                  </div>

                  {/* Rating Glass Pill */}
                  <div className="absolute top-3.5 right-3.5 bg-black/85 backdrop-blur-md text-white px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 text-xs font-bold border border-white/20">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>
                      {place.averageRating && Number(place.averageRating) > 0
                        ? Number(place.averageRating).toFixed(1)
                        : 'Novo'}
                    </span>
                    {place.totalReviews > 0 && (
                      <span className="text-slate-400 text-[10px] font-normal">
                        ({place.totalReviews})
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span>
                      {place.city} - {place.state}
                    </span>
                    {place.distanceKm !== undefined && (
                      <span className="text-purple-400 font-semibold ml-1">
                        • {place.distanceKm} km
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-black text-white group-hover:text-purple-300 transition-colors">
                    {place.name}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {place.description}
                  </p>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="px-6 py-4 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-xs font-bold text-purple-400 group-hover:text-purple-300">
                <span>Ver detalhes, horários e rota</span>
                <Navigation className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LocaisPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 text-xs">Carregando catálogo...</div>}>
      <LocaisContent />
    </Suspense>
  );
}
