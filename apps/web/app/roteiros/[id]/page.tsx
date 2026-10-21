'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowDown, ArrowUp, Link2, Map, X } from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';
import { ApiClient, type Roteiro } from '../../../lib/api-client';

// shortcut: o Google Maps aceita 9 paradas intermediárias na URL (11 locais); passar disso pede a Directions API
const MAX_NO_MAPS = 11;

function urlRota(stops: Roteiro['stops']) {
  const pts = stops.slice(0, MAX_NO_MAPS).map((s) => `${s.latitude},${s.longitude}`);
  const q = new URLSearchParams({ api: '1', travelmode: 'driving', destination: pts[pts.length - 1] });
  if (pts.length > 1) q.set('origin', pts[0]);
  if (pts.length > 2) q.set('waypoints', pts.slice(1, -1).join('|'));
  return `https://www.google.com/maps/dir/?${q}`;
}

export default function RoteiroPage() {
  const { id } = useParams<{ id: string }>();
  const { token, isLoading } = useAuth();
  const [roteiro, setRoteiro] = useState<Roteiro | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    ApiClient.getRoteiro(id, token).then(setRoteiro).catch((e) => setErro(e.message));
  }, [id, token, isLoading]);

  const salva = async (dados: { isPublic?: boolean; placeIds?: string[] }) => {
    if (!token) return;
    setErro(null);
    try {
      setRoteiro(await ApiClient.updateRoteiro(id, dados, token));
    } catch (e: any) {
      setErro(e.message);
    }
  };

  const move = (de: number, para: number) => {
    if (!roteiro) return;
    const ids = roteiro.stops.map((s) => s.id);
    ids.splice(para, 0, ...ids.splice(de, 1));
    salva({ placeIds: ids });
  };

  const copia = async () => {
    try {
      await navigator.clipboard.writeText(`${location.origin}/roteiros/${id}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setErro('Não foi possível copiar. Copie o endereço da barra do navegador.');
    }
  };

  if (!roteiro) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-slate-400">
        {erro ?? 'Carregando…'} {erro && <Link href="/" className="underline">Voltar ao início</Link>}
      </div>
    );
  }

  const dono = roteiro.isOwner;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{roteiro.title}</h1>

      <div className="my-6 flex flex-wrap items-center gap-3 text-sm">
        {roteiro.stops.length > 0 && (
          <a href={urlRota(roteiro.stops)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#f2a65a] px-4 py-2 font-bold text-[#0b0a17]">
            <Map className="h-4 w-4" /> Abrir rota no Google Maps
          </a>
        )}
        {roteiro.isPublic && (
          <button onClick={copia} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 font-bold">
            <Link2 className="h-4 w-4" /> {copiado ? 'Link copiado!' : 'Copiar link'}
          </button>
        )}
        {dono && (
          <label className="ml-auto flex items-center gap-2 text-slate-300">
            <input type="checkbox" checked={roteiro.isPublic} onChange={(e) => salva({ isPublic: e.target.checked })} />
            Qualquer pessoa com o link pode ver
          </label>
        )}
      </div>

      {roteiro.stops.length > MAX_NO_MAPS && (
        <p className="mb-4 text-xs text-slate-400">O Google Maps recebe só as primeiras {MAX_NO_MAPS} paradas.</p>
      )}
      {erro && <p role="alert" className="mb-4 text-sm text-red-400">{erro}</p>}

      {roteiro.stops.length === 0 ? (
        <p className="text-slate-400">Sem paradas ainda. Abra um local e use &quot;Adicionar a um roteiro&quot;.</p>
      ) : (
        <ol className="space-y-3">
          {roteiro.stops.map((s, i) => (
            <li key={s.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f2a65a] font-bold text-[#0b0a17]">{i + 1}</span>
              <Link href={`/locais/${s.slug}`} className="flex-1">
                <span className="font-bold">{s.name}</span>
                <span className="block text-xs text-slate-400">{s.category.name} · {s.city} - {s.state}</span>
              </Link>
              {dono && (
                <div className="flex gap-1">
                  <button disabled={i === 0} onClick={() => move(i, i - 1)} aria-label="Subir" className="p-2 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                  <button disabled={i === roteiro.stops.length - 1} onClick={() => move(i, i + 1)} aria-label="Descer" className="p-2 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                  <button onClick={() => salva({ placeIds: roteiro.stops.filter((x) => x.id !== s.id).map((x) => x.id) })} aria-label={`Remover ${s.name}`} className="p-2 hover:text-red-400"><X className="h-4 w-4" /></button>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
