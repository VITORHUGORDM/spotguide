'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { ApiClient, type RoteiroResumo } from '../../lib/api-client';

export default function RoteirosPage() {
  const { token, isLoading } = useAuth();
  const [lista, setLista] = useState<RoteiroResumo[] | null>(null);
  const [titulo, setTitulo] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (token) ApiClient.getRoteiros(token).then(setLista).catch((e) => setErro(e.message));
  }, [token]);

  const cria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setErro(null);
    try {
      const novo = await ApiClient.createRoteiro(titulo, token);
      setLista((l) => [novo, ...(l ?? [])]);
      setTitulo('');
    } catch (err: any) {
      setErro(err.message);
    }
  };

  const apaga = async (r: RoteiroResumo) => {
    if (!token || !confirm(`Apagar o roteiro "${r.title}"?`)) return;
    try {
      await ApiClient.deleteRoteiro(r.id, token);
      setLista((l) => l?.filter((x) => x.id !== r.id) ?? null);
    } catch (err: any) {
      setErro(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-3xl font-black tracking-tight sm:text-4xl">Meus roteiros</h1>

      {isLoading ? null : !token ? (
        <p className="text-slate-400">
          <Link href="/login" className="font-bold text-[#f2a65a] underline">Entre na sua conta</Link> para montar roteiros.
        </p>
      ) : (
        <>
          <form onSubmit={cria} className="mb-8 flex gap-3">
            <label className="sr-only" htmlFor="titulo">Nome do roteiro</label>
            <input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={100}
              placeholder="Ex.: Fim de semana em Gramado"
              className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#f2a65a]"
            />
            <button className="rounded-xl bg-[#f2a65a] px-5 py-3 text-sm font-bold text-[#0b0a17]">Criar</button>
          </form>

          {erro && <p role="alert" className="mb-4 text-sm text-red-400">{erro}</p>}

          {!lista ? (
            <p className="text-slate-400">Carregando…</p>
          ) : lista.length === 0 ? (
            <p className="text-slate-400">Nenhum roteiro ainda. Crie um e adicione locais pela página de cada local.</p>
          ) : (
            <ul className="space-y-3">
              {lista.map((r) => (
                <li key={r.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <Link href={`/roteiros/${r.id}`} className="flex-1">
                    <span className="font-bold">{r.title}</span>
                    <span className="ml-3 text-xs text-slate-400">
                      {r.totalStops} {r.totalStops === 1 ? 'parada' : 'paradas'} · {r.isPublic ? 'público' : 'privado'}
                    </span>
                  </Link>
                  <button onClick={() => apaga(r)} aria-label={`Apagar ${r.title}`} className="p-2 text-slate-400 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
