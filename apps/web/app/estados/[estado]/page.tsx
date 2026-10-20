import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, MapPin } from 'lucide-react';
import { ESTADOS, estadoPorSlug } from '@guia/contracts/brasil';
import { ApiClient } from '../../../lib/api-client';
import { SITE_URL } from '../../../lib/cidades';
import { MunicipiosDoEstado } from '../../../components/municipios-do-estado';
import { PlaceCard } from '../../../components/locais/place-card';
import '../../../components/hero/secoes.css';

export const revalidate = 120;
export const dynamicParams = false;

export function generateStaticParams() {
  return ESTADOS.map((e) => ({ estado: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ estado: string }> }): Promise<Metadata> {
  const estado = estadoPorSlug((await params).estado);
  if (!estado) return {};
  const titulo = `Onde comer, dormir e passear em ${estado.nome}`;
  return {
    title: titulo,
    description: `Restaurantes, bares, hotéis e pontos turísticos em ${estado.nome} (${estado.uf}), em qualquer cidade, com rota no Google Maps e nota de quem foi.`,
    alternates: { canonical: `${SITE_URL}/estados/${estado.slug}` },
  };
}

export default async function EstadoPage({ params }: { params: Promise<{ estado: string }> }) {
  const estado = estadoPorSlug((await params).estado);
  if (!estado) notFound();

  const [destaques, cidadesTop] = await Promise.all([
    ApiClient.searchPlacesPage({ state: estado.uf, limit: 6 }, { revalidate: 120 }).catch(() => ({ items: [], total: 0 })),
    ApiClient.getCities(undefined, { uf: estado.uf, limit: 12 }),
  ]);
  const comLugares = cidadesTop.filter((c) => c.count > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-14 pb-24">
      <header className="space-y-5">
        <p className="hero-mono text-xs tracking-wide text-purple-300">
          <Link href="/estados" className="hover:text-white transition">
            [ destinos
          </Link>{' '}
          · {estado.regiao.toLowerCase()} ]
        </p>
        <h1 className="hero-titulo text-5xl sm:text-7xl tracking-[-0.05em] leading-[0.95] text-[#faf6ee]">
          {estado.nome}
          <span className="hero-mono text-base sm:text-xl text-[#f2a65a] ml-3 align-middle">{estado.uf}</span>
        </h1>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <p className="text-slate-300">
            {destaques.total > 0
              ? `${destaques.total} ${destaques.total === 1 ? 'lugar' : 'lugares'} no guia`
              : 'Ainda sem lugares cadastrados neste estado.'}
          </p>
          <Link href={`/locais?estado=${estado.uf}`} className="botao-pilula">
            <span>Filtrar lugares em {estado.uf}</span>
            <span className="botao-pilula__circulo" aria-hidden="true">
              <ArrowRight />
            </span>
          </Link>
        </div>
      </header>

      {destaques.items.length > 0 && (
        <section className="space-y-5">
          <h2 className="hero-titulo text-2xl sm:text-3xl tracking-[-0.04em]">Mais bem avaliados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destaques.items.map((p) => (
              <PlaceCard key={p.id} place={p} />
            ))}
          </div>
        </section>
      )}

      {comLugares.length > 0 && (
        <section className="space-y-5">
          <h2 className="hero-titulo text-2xl sm:text-3xl tracking-[-0.04em]">Cidades com lugares no guia</h2>
          <ul className="flex flex-wrap gap-2">
            {comLugares.map((c) => (
              <li key={c.city}>
                <Link
                  href={`/locais?estado=${estado.uf}&cidade=${encodeURIComponent(c.city)}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.2] text-sm hover:bg-[#faf6ee] hover:text-[#0b0a17] transition"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {c.city}
                  <span className="hero-mono text-[11px] opacity-70">{c.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-5">
        <h2 className="hero-titulo text-2xl sm:text-3xl tracking-[-0.04em]">Todas as cidades de {estado.nome}</h2>
        <MunicipiosDoEstado uf={estado.uf} nomeEstado={estado.nome} />
      </section>
    </div>
  );
}
