'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ApiClient } from '../lib/api-client';
import { MapPin, X, Sparkles } from 'lucide-react';

interface CityOption {
  city: string;
  state: string;
  count: number;
}

interface CityAutocompleteProps {
  value: string;
  /** limita a busca a um estado (sigla) */
  uf?: string;
  onChange: (city: string) => void;
  onSelect?: (city: string, state: string) => void;
  placeholder?: string;
  name?: string;
  className?: string;
  inputClassName?: string;
}

// resultados já vistos nesta aba: voltar a uma busca (ou apagar uma letra) não vai à API de novo
const memoria = new Map<string, CityOption[]>();

export function CityAutocomplete({
  value,
  uf,
  onChange,
  onSelect,
  placeholder = 'Cidade (ex: Gramado, Rio de Janeiro)',
  name = 'cidade',
  className = '',
  inputClassName = '',
}: CityAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [options, setOptions] = useState<CityOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchCities = (text: string, imediato = false) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    const termo = text.trim();
    const chave = `${uf ?? ''}|${termo.toLowerCase()}`;
    const guardado = memoria.get(chave);
    if (guardado) {
      setOptions(guardado);
      setLoading(false);
      return;
    }

    const buscar = async () => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        const results = await ApiClient.getCities(termo, { uf, limit: 10, signal: ctrl.signal });
        memoria.set(chave, results);
        setOptions(results);
        setLoading(false);
      } catch {
        // pedido cancelado porque o texto mudou: o próximo já cuida do estado
      }
    };
    if (imediato) void buscar();
    else debounceRef.current = setTimeout(buscar, 150);
  };

  // trocou o estado: a lista antiga não vale mais
  useEffect(() => {
    setOptions([]);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, [uf]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setIsOpen(true);
    setHighlightedIndex(-1);
    searchCities(val);
  };

  const handleFocus = () => {
    setIsOpen(true);
    searchCities(query, true);
  };

  const handleSelectOption = (opt: CityOption) => {
    setQuery(opt.city);
    onChange(opt.city);
    if (onSelect) onSelect(opt.city, opt.state);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || options.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < options.length) {
        e.preventDefault();
        handleSelectOption(options[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center w-full">
        <input
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-label="Cidade"
          name={name}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full bg-transparent outline-none text-white placeholder-slate-500 text-sm ${inputClassName}`}
        />

        {query ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-white rounded-full transition"
            title="Limpar cidade"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Dropdown Dark Luxury */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2.5 bg-[#0b0b14]/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-2xl shadow-purple-950/70 py-2 z-50 max-h-72 overflow-y-auto animate-in fade-in duration-200">
          <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-purple-300/70 flex items-center justify-between border-b border-white/[0.06]">
            <span>{query.trim() ? 'Cidades encontradas' : uf ? `Cidades de ${uf}` : 'Destinos populares'}</span>
            {loading && <span className="animate-spin text-purple-400">●</span>}
          </div>

          {options.length === 0 && !loading ? (
            <div className="p-4 text-center text-xs text-slate-400">
              Nenhuma cidade encontrada para &quot;{query}&quot;{uf ? ` em ${uf}` : ''}. Confira a grafia ou tire o filtro de estado.
            </div>
          ) : (
            options.map((opt, idx) => (
              <button
                key={`${opt.city}-${opt.state}`}
                type="button"
                onClick={() => handleSelectOption(opt)}
                className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between text-xs transition ${
                  highlightedIndex === idx
                    ? 'bg-purple-600/25 text-white font-medium border-l-2 border-purple-500'
                    : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-white">{opt.city}</span>
                  <span className="text-purple-300/60 font-semibold text-[11px]">({opt.state})</span>
                </div>

                {opt.count > 0 ? (
                  <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                    {opt.count} {opt.count === 1 ? 'local' : 'locais'}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                    Destino
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
