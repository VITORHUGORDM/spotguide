'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useFavorites } from '../lib/favorites-context';

export function FavoriteButton({ placeId, className = '' }: { placeId: string; className?: string }) {
  const { ids, toggle } = useFavorites();
  const router = useRouter();
  const [erro, setErro] = useState(false);
  const ativo = ids.has(placeId);

  return (
    <button
      type="button"
      aria-pressed={ativo}
      aria-label={ativo ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
      title={erro ? 'Não foi possível salvar. Tente de novo.' : ativo ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
      onClick={async () => {
        setErro(false);
        try {
          if (!(await toggle(placeId))) router.push('/login');
        } catch {
          setErro(true);
        }
      }}
      className={`z-10 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/75 transition hover:scale-110 hover:border-[#f2a65a]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f2a65a] ${className}`}
    >
      <Heart className={`h-5 w-5 ${erro ? 'text-red-400' : ativo ? 'fill-[#f2a65a] text-[#f2a65a]' : 'text-white'}`} />
    </button>
  );
}
