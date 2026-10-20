'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { CityAutocomplete } from './city-autocomplete';

/** Formulário de busca da home: a única parte da página que precisa de JavaScript no navegador. */
export function BuscaHome() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [uf, setUf] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('busca', search.trim());
    if (city.trim()) params.set('cidade', city.trim());
    if (city.trim() && uf) params.set('estado', uf);
    router.push(`/locais?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="bg-[#0b0b14]/85 backdrop-blur-2xl p-2.5 sm:p-3 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/[0.12] ring-1 ring-purple-500/20 flex flex-col md:flex-row items-center gap-2 hover:border-purple-500/40 transition-all duration-300"
    >
      <div className="flex-1 w-full flex items-center px-4 py-3 gap-3 bg-white/[0.03] hover:bg-white/[0.05] focus-within:bg-white/[0.06] rounded-2xl border border-white/[0.05] focus-within:border-purple-500/50 transition">
        <Search className="w-5 h-5 text-purple-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="O que você procura? (ex: café colonial, pizza, pousada...)"
          aria-label="O que você procura"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs sm:text-sm bg-transparent outline-none text-white placeholder-slate-500 font-medium"
        />
      </div>

      <div className="w-full md:w-80 flex items-center px-4 py-3 gap-2.5 bg-white/[0.03] hover:bg-white/[0.05] focus-within:bg-white/[0.06] rounded-2xl border border-white/[0.05] focus-within:border-indigo-500/50 transition">
        <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0" />
        <CityAutocomplete
          value={city}
          onChange={(val) => {
            setCity(val);
            setUf('');
          }}
          onSelect={(cidade, estado) => {
            setCity(cidade);
            setUf(estado);
          }}
          placeholder="Qualquer cidade do Brasil..."
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
  );
}
