'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { PlaceListItem } from '@guia/contracts';
import { useAuth } from '../../lib/auth-context';
import { useFavorites } from '../../lib/favorites-context';
import { ApiClient } from '../../lib/api-client';
import { PlaceCard } from '../../components/locais/place-card';

export default function FavoritosPage() {
  const { token, isLoading } = useAuth();
  const { ids } = useFavorites();
  const [lista, setLista] = useState<PlaceListItem[] | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!token) return;
    ApiClient.getFavorites(token).then(setLista).catch(() => setErro(true));
  }, [token]);

  // tirar o coração aqui some com o card na hora, sem nova consulta
  const visiveis = lista?.filter((p) => ids.has(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-3xl font-black tracking-tight sm:text-4xl">Meus favoritos</h1>

      {isLoading ? null : !token ? (
        <p className="text-slate-400">
          <Link href="/login" className="font-bold text-[#f2a65a] underline">Entre na sua conta</Link> para ver os locais que você salvou.
        </p>
      ) : erro ? (
        <p role="alert" className="text-red-400">Não foi possível carregar seus favoritos agora.</p>
      ) : !visiveis ? (
        <p className="text-slate-400">Carregando…</p>
      ) : visiveis.length === 0 ? (
        <p className="text-slate-400">
          Você ainda não salvou nenhum local. <Link href="/locais" className="font-bold text-[#f2a65a] underline">Explorar locais</Link>
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {visiveis.map((p) => (
            <PlaceCard key={p.id} place={p} />
          ))}
        </div>
      )}
    </div>
  );
}
