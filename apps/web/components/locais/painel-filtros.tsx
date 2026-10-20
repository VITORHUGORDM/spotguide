'use client';

import { useState } from 'react';
import { Search, MapPin, LocateFixed, Star, SlidersHorizontal, Clock, Camera, BadgeCheck, ArrowUpDown } from 'lucide-react';
import type { CategoryResponse } from '@guia/contracts';
import { ESTADOS } from '@guia/contracts/brasil';
import { COMODIDADES, FAIXAS_PRECO } from '@guia/contracts/comodidades';
import { CityAutocomplete } from '../city-autocomplete';
import { NOTAS, ORDENS, RAIOS_KM, type Filtros, type Perto } from '../../lib/filtros-locais';

interface Props {
  filtros: Filtros;
  /** texto digitado, ainda não aplicado */
  busca: string;
  cidadeTexto: string;
  categorias: CategoryResponse[];
  contagemPorEstado: Map<string, number>;
  perto: Perto | null;
  geoStatus: 'idle' | 'buscando' | 'negado';
  quantosFiltros: number;
  onBusca: (v: string) => void;
  onCidadeTexto: (v: string) => void;
  onAplicar: (patch: Partial<Filtros>) => void;
  onEnviar: () => void;
  onPerto: () => void;
  onRaio: (km: number) => void;
}

const campo =
  'flex items-center px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl transition focus-within:bg-white/[0.06]';
const pilula = (ativo: boolean, cor = 'bg-[#faf6ee] text-[#0b0a17] border-[#faf6ee]') =>
  `px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap border flex items-center gap-1.5 ${
    ativo ? cor : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border-white/[0.06]'
  }`;

export function PainelFiltros(p: Props) {
  const { filtros: f } = p;
  const [maisAberto, setMaisAberto] = useState(false);

  const alternaComodidade = (id: string) =>
    p.onAplicar({
      comodidades: f.comodidades.includes(id) ? f.comodidades.filter((c) => c !== id) : [...f.comodidades, id],
    });

  const alternaCategoria = (slug: string) =>
    p.onAplicar({
      categorias: f.categorias.includes(slug) ? f.categorias.filter((c) => c !== slug) : [...f.categorias, slug],
    });

  return (
    <div className="bg-[#0b0b14]/90 p-5 sm:p-6 rounded-3xl border border-white/[0.1] shadow-2xl shadow-purple-950/40 space-y-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          p.onEnviar();
        }}
        className="grid grid-cols-1 md:grid-cols-12 gap-3"
      >
        <div className={`${campo} md:col-span-4 focus-within:border-purple-500/60`}>
          <Search className="w-4 h-4 text-purple-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Nome do local, comida ou serviço..."
            aria-label="Buscar por nome, comida ou serviço"
            value={p.busca}
            onChange={(e) => p.onBusca(e.target.value)}
            className="bg-transparent w-full text-xs sm:text-sm outline-none text-white placeholder-slate-500 font-medium"
          />
        </div>

        <div className={`${campo} md:col-span-3 focus-within:border-emerald-500/60`}>
          <MapPin className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
          <select
            aria-label="Estado"
            value={f.estado}
            onChange={(e) => p.onAplicar({ estado: e.target.value, cidade: '' })}
            className="bg-transparent w-full text-xs sm:text-sm outline-none text-white font-medium cursor-pointer"
          >
            <option value="" className="bg-[#0b0b14]">
              Todos os estados
            </option>
            {ESTADOS.map((e) => {
              const n = p.contagemPorEstado.get(e.uf);
              return (
                <option key={e.uf} value={e.uf} className="bg-[#0b0b14]">
                  {e.nome} ({e.uf}){n ? ` · ${n}` : ''}
                </option>
              );
            })}
          </select>
        </div>

        <div className={`${campo} md:col-span-3 focus-within:border-cyan-500/60`}>
          <MapPin className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0" />
          <CityAutocomplete
            value={p.cidadeTexto}
            uf={f.estado || undefined}
            onChange={(v) => {
              p.onCidadeTexto(v);
              if (!v && f.cidade) p.onAplicar({ cidade: '' });
            }}
            onSelect={(cidade, estado) => p.onAplicar({ cidade, estado })}
            placeholder={f.estado ? `Cidade em ${f.estado}...` : 'Qualquer cidade...'}
            className="w-full"
            inputClassName="font-medium text-xs sm:text-sm text-white"
          />
        </div>

        <div className="md:col-span-2 flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-[#faf6ee] hover:bg-white text-[#0b0a17] font-extrabold text-xs sm:text-sm py-3 px-4 rounded-2xl transition shadow-[0_0_20px_rgba(242,166,90,0.35)] flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4 flex-shrink-0" />
            <span>Buscar</span>
          </button>
          <button
            type="button"
            onClick={p.onPerto}
            aria-pressed={Boolean(p.perto)}
            title="Só lugares num raio perto de você"
            className={`flex-shrink-0 px-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition ${
              p.perto ? 'bg-[#f2a65a] text-[#0b0a17] border-[#f2a65a]' : 'border-white/[0.15] text-slate-200 hover:bg-white/[0.08]'
            }`}
          >
            <LocateFixed className={`w-4 h-4 ${p.geoStatus === 'buscando' ? 'animate-pulse' : ''}`} />
            <span className="sr-only">Perto de mim</span>
          </button>
        </div>
      </form>

      {/* Categorias (pode marcar mais de uma) */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button type="button" onClick={() => p.onAplicar({ categorias: [] })} className={pilula(f.categorias.length === 0, 'bg-purple-600 text-white border-purple-500')}>
          Todas
        </button>
        {p.categorias.map((cat) => (
          <button
            key={cat.id}
            type="button"
            aria-pressed={f.categorias.includes(cat.slug)}
            onClick={() => alternaCategoria(cat.slug)}
            className={pilula(f.categorias.includes(cat.slug), 'bg-purple-600 text-white border-purple-500')}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Comodidades (o local precisa ter todas as marcadas) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="group" aria-label="Comodidades">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] flex-shrink-0">Tem</span>
        {COMODIDADES.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={f.comodidades.includes(c.id)}
            onClick={() => alternaComodidade(c.id)}
            className={pilula(f.comodidades.includes(c.id), 'bg-[#f2a65a] text-[#0b0a17] border-[#f2a65a]')}
          >
            {c.rotulo}
          </button>
        ))}
      </div>

      {/* Mais filtros */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setMaisAberto((v) => !v)}
          aria-expanded={maisAberto}
          className="lg:hidden inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Mais filtros{p.quantosFiltros ? ` (${p.quantosFiltros})` : ''}
        </button>

        <div className={`${maisAberto ? 'flex' : 'hidden'} lg:flex flex-wrap items-center gap-x-6 gap-y-3`}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Nota</span>
            {NOTAS.map((n) => (
              <button
                key={String(n.valor)}
                type="button"
                aria-pressed={f.avaliacao === n.valor}
                onClick={() => p.onAplicar({ avaliacao: n.valor })}
                className={pilula(f.avaliacao === n.valor, 'bg-amber-500 text-slate-900 border-amber-500')}
              >
                {n.valor && <Star className="w-3 h-3 fill-current" />}
                {n.rotulo}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button type="button" aria-pressed={f.aberto} onClick={() => p.onAplicar({ aberto: !f.aberto })} className={pilula(f.aberto, 'bg-emerald-500 text-slate-900 border-emerald-500')}>
              <Clock className="w-3.5 h-3.5" />
              Aberto agora
            </button>
            <button type="button" aria-pressed={f.comFoto} onClick={() => p.onAplicar({ comFoto: !f.comFoto })} className={pilula(f.comFoto)}>
              <Camera className="w-3.5 h-3.5" />
              Com fotos
            </button>
            <button type="button" aria-pressed={f.verificado} onClick={() => p.onAplicar({ verificado: !f.verificado })} className={pilula(f.verificado)}>
              <BadgeCheck className="w-3.5 h-3.5" />
              Verificados
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Preço</span>
            <button type="button" aria-pressed={!f.preco} onClick={() => p.onAplicar({ preco: undefined })} className={pilula(!f.preco)}>
              Qualquer
            </button>
            {FAIXAS_PRECO.map((faixa) => (
              <button
                key={faixa.nivel}
                type="button"
                aria-pressed={f.preco === faixa.nivel}
                title={`Até ${faixa.rotulo.toLowerCase()}`}
                onClick={() => p.onAplicar({ preco: f.preco === faixa.nivel ? undefined : faixa.nivel })}
                className={pilula(f.preco === faixa.nivel, 'bg-emerald-500 text-slate-900 border-emerald-500')}
              >
                <span className="font-mono">{faixa.simbolo}</span>
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="sr-only">Ordenar por</span>
            <select
              value={f.ordem}
              onChange={(e) => p.onAplicar({ ordem: e.target.value })}
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs font-bold text-white outline-none cursor-pointer"
            >
              {ORDENS.map((o) => (
                <option key={o.valor} value={o.valor} disabled={o.valor === 'distance' && !p.perto} className="bg-[#0b0b14]">
                  {o.rotulo}
                </option>
              ))}
            </select>
          </label>

          {p.perto && (
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Raio</span>
              <select
                value={p.perto.raioKm}
                onChange={(e) => p.onRaio(Number(e.target.value))}
                className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs font-bold text-white outline-none cursor-pointer"
              >
                {RAIOS_KM.map((km) => (
                  <option key={km} value={km} className="bg-[#0b0b14]">
                    {km} km
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
