import { memo } from 'react';
import Link from 'next/link';
import { MapPin, Star, Navigation } from 'lucide-react';
import type { PlaceListItem } from '@guia/contracts';
import { simboloPreco } from '@guia/contracts/comodidades';
import { FavoriteButton } from '../favorite-button';
import { CidadeArte, slugCidade } from '../cidade-arte';

function PlaceCardBase({ place, prioridade = false }: { place: PlaceListItem; prioridade?: boolean }) {
  return (
    <div className="relative flex flex-col">
    <Link
      href={`/locais/${place.slug}`}
      className="group flex-1 bg-[#0a0a14]/90 rounded-3xl border border-white/[0.08] overflow-hidden shadow-xl hover:border-purple-500/50 hover:shadow-[0_0_35px_rgba(242,166,90,0.2)] hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        <div className="relative h-56 bg-zinc-900 overflow-hidden">
          {place.coverPhotoUrl ? (
            <img
              src={place.coverPhotoUrl}
              alt={place.name}
              // as primeiras fotos carregam já; o resto só quando chega perto da tela
              loading={prioridade ? 'eager' : 'lazy'}
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out">
              <CidadeArte slug={slugCidade(place.city)} />
            </div>
          )}

          <div className="absolute top-3.5 left-3.5">
            <span className="bg-black/75 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20 shadow-sm">
              {place.category.name}
              {simboloPreco(place.priceLevel) && <span className="ml-2 font-mono text-[#f2a65a]">{simboloPreco(place.priceLevel)}</span>}
            </span>
          </div>

          <div className="absolute top-3.5 right-3.5 bg-black/85 text-white px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 text-xs font-bold border border-white/20">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>
              {place.averageRating && Number(place.averageRating) > 0 ? Number(place.averageRating).toFixed(1) : 'Novo'}
            </span>
            {place.totalReviews > 0 && <span className="text-slate-400 text-[10px] font-normal">({place.totalReviews})</span>}
          </div>
        </div>

        <div className="p-6 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span>
              {place.city} - {place.state}
            </span>
            {place.distanceKm !== undefined && <span className="text-purple-400 font-semibold ml-1">• {place.distanceKm} km</span>}
          </div>

          <h3 className="text-xl font-black text-white group-hover:text-purple-300 transition-colors">{place.name}</h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{place.description}</p>
        </div>
      </div>

      <div className="px-6 py-4 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-xs font-bold text-purple-400 group-hover:text-purple-300">
        <span>Ver detalhes, horários e rota</span>
        <Navigation className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
    <FavoriteButton placeId={place.id} className="absolute bottom-[4.6rem] right-3.5" />
    </div>
  );
}

export const PlaceCard = memo(PlaceCardBase);
