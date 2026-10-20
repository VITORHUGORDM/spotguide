import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, MapPin, Star, CalendarDays } from 'lucide-react';
import type { PlaceListItem } from '@guia/contracts';
import { ApiClient } from '../../../lib/api-client';
import { CIDADES, SITE_URL, cidadePorSlug } from '../../../lib/cidades';
import { CidadeArte } from '../../../components/cidade-arte';
import '../../../components/hero/secoes.css';

export const dynamicParams = false;
// gerada uma vez e renovada a cada minuto: quem cadastra um local aparece aqui em até 60s, e ninguém espera a API
export const revalidate = 60;

export function generateStaticParams() {
  return CIDADES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cidade = cidadePorSlug(slug);
  if (!cidade) return {};

  const titulo = `Onde comer, dormir e passear em ${cidade.nome}`;
  return {
    title: titulo,
    description: `${cidade.texto} Veja restaurantes, bares, hotéis e pontos turísticos de ${cidade.nome}, com rota no Google Maps.`,
    alternates: { canonical: `${SITE_URL}/cidades/${cidade.slug}` },
    openGraph: { title: `${titulo} | SpotGuide`, description: cidade.texto, url: `${SITE_URL}/cidades/${cidade.slug}`, locale: 'pt_BR', type: 'website' },
  };
}

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

export default async function CidadePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cidade = cidadePorSlug(slug);
  if (!cidade) notFound();

  let lugares: PlaceListItem[] = [];
  try {
    lugares = await ApiClient.searchPlaces({ city: cidade.nome, state: cidade.uf, limit: 50 }, { revalidate: 60 });
  } catch {
    lugares = [];
  }

  // agrupa por categoria, mantendo a ordem em que aparecem
  const grupos = new Map<string, { nome: string; itens: PlaceListItem[] }>();
  for (const l of lugares) {
    const g = grupos.get(l.category.slug) ?? { nome: l.category.name, itens: [] };
    g.itens.push(l);
    grupos.set(l.category.slug, g);
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Lugares em ${cidade.nome}`,
    itemListElement: lugares.map((l, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/locais/${l.slug}`,
      name: l.name,
    })),
  };

  return (
    <div className="space-y-14 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      {/* Capa ilustrada */}
      <header className="relative h-[22rem] sm:h-[26rem] overflow-hidden -mt-[84px]">
        <CidadeArte slug={cidade.slug} alinha="xMidYMid" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a17] via-[#0b0a17]/30 to-transparent" />
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 flex flex-col justify-end pb-10 gap-4">
          <p className="hero-mono text-xs tracking-wide text-[#faf6ee]/80">
            [ {cidade.tag.toLowerCase()} · {cidade.uf} ]
          </p>
          <h1 className="hero-titulo text-5xl sm:text-7xl tracking-[-0.05em] leading-[0.95] text-[#faf6ee]">{cidade.nome}</h1>
          <p className="text-[#faf6ee]/80 max-w-xl text-sm sm:text-base">{cidade.subtitulo}</p>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 grid gap-8 lg:grid-cols-[1.4fr_1fr] items-start">
        <p className="text-lg sm:text-xl leading-relaxed text-[#faf6ee]/85">{cidade.texto}</p>
        <dl className="grid grid-cols-2 border-y border-white/[0.1] divide-x divide-white/[0.1]">
          <div className="py-4 pr-4 space-y-1">
            <dt className="hero-mono text-[11px] text-slate-400">No guia</dt>
            <dd className="text-xl font-medium tabular-nums">{plural(lugares.length, 'lugar', 'lugares')}</dd>
          </div>
          <div className="py-4 pl-4 space-y-1">
            <dt className="hero-mono text-[11px] text-slate-400">Melhor época</dt>
            <dd className="text-sm leading-snug text-[#faf6ee]/85 flex gap-1.5">
              <CalendarDays className="w-4 h-4 text-[#f2a65a] mt-0.5 flex-shrink-0" />
              {cidade.epoca}
            </dd>
          </div>
        </dl>
      </section>

      {grupos.size === 0 ? (
        <section className="max-w-7xl mx-auto px-4">
          <div className="rounded-3xl border border-white/[0.1] p-10 text-center space-y-4">
            <p className="hero-titulo text-2xl">Ainda não há lugares em {cidade.nome}.</p>
            <p className="text-sm text-slate-400">Tem um negócio aqui? Seja o primeiro a aparecer no guia.</p>
            <Link href="/comerciante" className="botao-pilula">
              <span>Cadastrar meu estabelecimento</span>
              <span className="botao-pilula__circulo" aria-hidden="true">
                <ArrowRight />
              </span>
            </Link>
          </div>
        </section>
      ) : (
        Array.from(grupos.entries()).map(([catSlug, g]) => (
          <section key={catSlug} className="max-w-7xl mx-auto px-4 space-y-5">
            <div className="flex items-end justify-between gap-4">
              <h2 className="hero-titulo text-2xl sm:text-3xl tracking-[-0.04em]">{g.nome}</h2>
              <Link
                href={`/locais?estado=${cidade.uf}&cidade=${encodeURIComponent(cidade.nome)}&categoria=${catSlug}`}
                className="hero-mono text-xs text-[#f2a65a] hover:text-[#faf6ee] transition"
              >
                ver no mapa e na lista →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {g.itens.map((l) => (
                <Link
                  key={l.id}
                  href={`/locais/${l.slug}`}
                  className="group rounded-3xl border border-white/[0.1] bg-white/[0.03] overflow-hidden hover:border-[#f2a65a]/60 transition"
                >
                  <div className="relative h-36 overflow-hidden">
                    {l.coverPhotoUrl ? (
                      <img src={l.coverPhotoUrl} alt={l.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                    ) : (
                      <div className="absolute inset-0 group-hover:scale-105 transition duration-700">
                        <CidadeArte slug={cidade.slug} />
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-1.5">
                    <h3 className="hero-titulo text-lg leading-tight group-hover:text-[#ffcf9f] transition">{l.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{l.description}</p>
                    <p className="hero-mono text-[11px] text-slate-300 flex items-center gap-3 pt-1">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#f2a65a] fill-[#f2a65a]" />
                        {l.averageRating > 0 ? Number(l.averageRating).toFixed(1) : 'Novo'}
                      </span>
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3" />
                        {l.city}
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}

      <section className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.1] pt-8">
          <p className="hero-mono text-xs text-slate-400">Outras cidades</p>
          <div className="flex flex-wrap gap-2">
            {CIDADES.filter((c) => c.slug !== cidade.slug).map((c) => (
              <Link
                key={c.slug}
                href={`/cidades/${c.slug}`}
                className="px-4 py-2 rounded-full border border-white/[0.15] text-sm hover:bg-[#faf6ee] hover:text-[#0b0a17] transition"
              >
                {c.nome}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
