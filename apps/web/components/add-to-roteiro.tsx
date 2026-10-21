'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ListPlus } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { ApiClient, type RoteiroResumo } from '../lib/api-client';

export function AddToRoteiro({ placeId }: { placeId: string }) {
  const { token } = useAuth();
  const router = useRouter();
  const [lista, setLista] = useState<RoteiroResumo[] | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const abre = async () => {
    if (!token) return router.push('/login');
    setMsg(null);
    try {
      setLista(await ApiClient.getRoteiros(token));
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  const adiciona = async (r: RoteiroResumo) => {
    if (!token) return;
    try {
      const atual = await ApiClient.getRoteiro(r.id, token);
      const ids = atual.stops.map((s) => s.id);
      if (!ids.includes(placeId)) await ApiClient.updateRoteiro(r.id, { placeIds: [...ids, placeId] }, token);
      setMsg(`Adicionado a "${r.title}".`);
      setLista(null);
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  return (
    <div className="text-sm">
      <button onClick={abre} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 font-bold hover:border-[#f2a65a]/60">
        <ListPlus className="h-4 w-4" /> Adicionar a um roteiro
      </button>
      {lista && (
        <ul className="mt-2 space-y-1 rounded-xl border border-white/10 bg-black/60 p-2">
          {lista.length === 0 && (
            <li className="p-2 text-slate-400">
              Você ainda não tem roteiros. <Link href="/roteiros" className="underline">Criar um</Link>
            </li>
          )}
          {lista.map((r) => (
            <li key={r.id}>
              <button onClick={() => adiciona(r)} className="w-full rounded-lg p-2 text-left hover:bg-white/10">
                {r.title} <span className="text-xs text-slate-400">({r.totalStops})</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {msg && <p role="status" className="mt-2 text-slate-300">{msg}</p>}
    </div>
  );
}
