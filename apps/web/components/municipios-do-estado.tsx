'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, MapPin } from 'lucide-react';
import { ApiClient } from '../lib/api-client';

interface Cidade {
  city: string;
  state: string;
  count: number;
}

const PASSO = 24;

/** Todas as cidades do estado, com busca. Só baixa a lista quando a pessoa chega aqui. */
export function MunicipiosDoEstado({ uf, nomeEstado }: { uf: string; nomeEstado: string }) {
  const [q, setQ] = useState('');
  const [limite, setLimite] = useState(PASSO);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => setLimite(PASSO), [q]);

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(
      () => {
        setCarregando(true);
        // pede um a mais que o limite para saber se ainda tem o que mostrar
        ApiClient.getCities(q.trim(), { uf, limit: limite + 1, signal: ctrl.signal })
          .then((lista) => {
            setCidades(lista);
            setCarregando(false);
          })
          .catch(() => {});
      },
      q ? 200 : 0
    );
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, uf, limite]);

  const visiveis = cidades.slice(0, limite);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.04] border border-white/[0.12] rounded-2xl max-w-md focus-within:border-[#f2a65a]/70 transition">
        <Search className="w-4 h-4 text-[#f2a65a] flex-shrink-0" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Buscar cidade em ${nomeEstado}...`}
          aria-label={`Buscar cidade em ${nomeEstado}`}
          className="w-full bg-transparent outline-none text-sm text-white placeholder-slate-500"
        />
      </div>

      <ul className={`grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-opacity ${carregando ? 'opacity-60' : ''}`}>
        {visiveis.map((c) => (
          <li key={c.city}>
            <Link
              href={`/locais?estado=${uf}&cidade=${encodeURIComponent(c.city)}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.1] px-4 py-3 text-sm hover:border-[#f2a65a]/60 hover:bg-white/[0.05] transition"
            >
              <span className="flex items-center gap-2 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="truncate">{c.city}</span>
              </span>
              {c.count > 0 && <span className="hero-mono text-[11px] text-[#f2a65a] flex-shrink-0">{c.count}</span>}
            </Link>
          </li>
        ))}
      </ul>

      {!carregando && visiveis.length === 0 && (
        <p className="text-sm text-slate-400">
          Nenhuma cidade de {nomeEstado} com “{q}”.
        </p>
      )}

      {cidades.length > limite && (
        <button
          type="button"
          onClick={() => setLimite((l) => l + PASSO * 2)}
          className="px-6 py-2.5 rounded-2xl border border-white/20 text-sm font-bold hover:bg-white/10 transition"
        >
          Mostrar mais cidades
        </button>
      )}
    </div>
  );
}
