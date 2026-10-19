import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '../../../lib/api-client';
import { PlaceReviews } from '../../../components/place-reviews';
import {
  MapPin,
  Star,
  Phone,
  Globe,
  Navigation,
  Clock,
  ArrowLeft,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { CidadeArte, slugCidade } from '../../../components/cidade-arte';

const DAY_LABELS: Record<string, string> = {
  SUNDAY: 'Domingo',
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
};

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let place;
  let reviews = [];

  try {
    place = await ApiClient.getPlaceBySlug(slug);
    reviews = await ApiClient.getPlaceReviews(place.id);
  } catch (err) {
    notFound();
  }

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 bg-[#0b0a17] text-slate-100">
      {/* Top Navigation / Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link
          href="/locais"
          className="flex items-center gap-1.5 hover:text-purple-400 transition font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para locais
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-purple-300 font-semibold truncate">{place.name}</span>
      </div>

      {/* Place Header Dark Luxury */}
      <div className="relative bg-[#0a0a14]/90 rounded-3xl border border-white/[0.08] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl space-y-6 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-bold rounded-full uppercase tracking-wider">
                {place.category.name}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Local 100% Verificado
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {place.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm">
                  {place.averageRating && Number(place.averageRating) > 0
                    ? Number(place.averageRating).toFixed(1)
                    : 'Novo'}
                </span>
                <span className="text-slate-400 font-normal">
                  ({place.totalReviews}{' '}
                  {place.totalReviews === 1 ? 'avaliação' : 'avaliações'})
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>
                  {place.neighborhood}, {place.city} - {place.state}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3.5 bg-[#faf6ee] hover:bg-white text-[#0b0a17] rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-[0_0_25px_rgba(242,166,90,0.4)] hover:shadow-[0_0_35px_rgba(242,166,90,0.6)] hover:scale-[1.02]"
            >
              <Navigation className="w-4 h-4" />
              Rotas no Google Maps
            </a>

            {place.phone && (
              <a
                href={`tel:${place.phone}`}
                className="px-4 py-3.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.1] rounded-2xl text-xs font-semibold transition flex items-center gap-2 hover:border-purple-500/40"
              >
                <Phone className="w-4 h-4 text-purple-400" />
                {place.phone}
              </a>
            )}

            {place.websiteUrl && (
              <a
                href={place.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.1] rounded-2xl text-xs font-semibold transition flex items-center gap-2 hover:border-purple-500/40"
              >
                <Globe className="w-4 h-4 text-cyan-400" />
                Website Oficial
              </a>
            )}
          </div>
        </div>

        {/* Photo Gallery Banner */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl overflow-hidden max-h-[440px] border border-white/[0.08]">
          <div className="md:col-span-2 h-72 sm:h-96 bg-[#0e0e1a] relative group overflow-hidden">
            {place.coverPhotoUrl ? (
              <img
                src={place.coverPhotoUrl}
                alt={place.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="relative w-full h-full">
                <CidadeArte slug={slugCidade(place.city)} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-transparent to-transparent opacity-40 pointer-events-none" />
          </div>

          <div className="hidden md:flex flex-col gap-4">
            {place.photos && place.photos.length > 1 ? (
              place.photos.slice(1, 3).map((photo) => (
                <div
                  key={photo.id}
                  className="h-[184px] bg-[#0e0e1a] rounded-xl overflow-hidden relative group"
                >
                  <img
                    src={photo.url}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))
            ) : (
              <div className="h-full bg-white/[0.02] border border-dashed border-white/[0.1] rounded-xl flex items-center justify-center text-xs text-slate-500 p-6 text-center">
                Galeria completa com fotos dos visitantes em breve.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <div className="bg-[#0a0a14]/90 rounded-3xl border border-white/[0.08] p-6 sm:p-8 space-y-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
              Sobre o Local
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-normal">
              {place.description}
            </p>
          </div>

          {/* Location & Map Section */}
          <div className="bg-[#0a0a14]/90 rounded-3xl border border-white/[0.08] p-6 sm:p-8 space-y-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              Localização e Endereço
            </h2>
            <div className="space-y-1 text-sm text-slate-300">
              <p className="font-semibold text-white">
                {place.street}, {place.number}
              </p>
              <p className="text-slate-400">
                Bairro {place.neighborhood} • {place.city} - {place.state}
              </p>
              <p className="text-slate-500 text-xs">CEP: {place.postalCode}</p>
            </div>

            <div className="pt-2">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 transition group"
              >
                <span>Abrir rota com GPS no aplicativo de mapas</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
          </div>

          {/* Reviews & Social Proof */}
          <PlaceReviews placeId={place.id} initialReviews={reviews} />
        </div>

        {/* Sidebar Info (1 col) */}
        <div className="space-y-6">
          {/* Operating Hours Card */}
          <div className="bg-[#0a0a14]/90 rounded-3xl border border-white/[0.08] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-purple-400" />
                Horários de Atendimento
              </h3>
            </div>

            <div className="divide-y divide-white/[0.06] text-xs">
              {place.hours && place.hours.length > 0 ? (
                place.hours.map((h, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between">
                    <span className="font-medium text-slate-300">
                      {DAY_LABELS[h.day] || h.day}
                    </span>
                    <span
                      className={`font-semibold ${
                        h.isClosed ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {h.isClosed ? 'Fechado' : `${h.openTime} - ${h.closeTime}`}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-slate-500 text-xs">
                  Horários flexíveis ou a consultar diretamente com o estabelecimento.
                </div>
              )}
            </div>
          </div>

          {/* Quick info card Dark Luxury */}
          <div className="bg-gradient-to-br from-purple-950/40 via-indigo-950/30 to-[#0a0a14] border border-purple-500/20 rounded-3xl p-6 text-xs text-purple-200/90 space-y-3 shadow-[0_0_30px_rgba(242,166,90,0.1)]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <h4 className="font-bold text-sm text-white">Garantia SpotGuide</h4>
            </div>
            <p className="leading-relaxed text-slate-400 text-[11px]">
              As informações cadastrais e avaliações são monitoradas para garantir precisão e
              autenticidade para sua viagem ou passeio local.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
