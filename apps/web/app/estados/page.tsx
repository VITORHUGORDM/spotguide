import type { Metadata } from 'next';
import Link from 'next/link';
import { ESTADOS, REGIOES } from '@guia/contracts/brasil';
import { ApiClient } from '../../lib/api-client';
import { SITE_URL } from '../../lib/cidades';
import '../../components/hero/secoes.css';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Destinos por estado',
  description:
    'Escolha o estado e veja restaurantes, bares, hotéis e pontos turísticos em qualquer cidade do Brasil, com rota no Google Maps.',
  alternates: { canonical: `${SITE_URL}/estados` },
};

export default async function EstadosPage() {
  const comLugares = await ApiClient.getStates();
  const porEstado = new Map(comLugares.map((e) => [e.uf, e.count]));
  const total = comLugares.reduce((s, e) => s + e.count, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-14 pb-24">
      <header className="space-y-4 max-w-3xl">
        <p className="hero-mono text-xs tracking-wide text-purple-300">[ destinos ]</p>
        <h1 className="hero-titulo text-4xl sm:text-6xl tracking-[-0.045em] leading-[1.02] text-[#faf6ee]">
          Para onde no Brasil?
        </h1>
        <p className="text-slate-300 leading-relaxed">
          Os 27 estados e mais de 5 mil cidades estão no guia. {total > 0 && `${total} lugares já cadastrados.`} Escolha um
          estado ou{' '}
          <Link href="/locais" className="text-[#f2a65a] underline underline-offset-4">
            busque direto por cidade
          </Link>
          .
        </p>
      </header>

      {REGIOES.map((regiao) => (
        <section key={regiao} className="space-y-5" aria-labelledby={`regiao-${regiao}`}>
          <h2 id={`regiao-${regiao}`} className="hero-mono text-xs tracking-wide text-[#f2a65a]">
            [ {regiao.toLowerCase()} ]
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ESTADOS.filter((e) => e.regiao === regiao).map((e) => {
              const n = porEstado.get(e.uf) ?? 0;
              return (
                <li key={e.uf}>
                  <Link
                    href={`/estados/${e.slug}`}
                    className={`group flex items-center justify-between gap-4 rounded-3xl border p-5 transition hover:border-[#f2a65a]/70 hover:bg-white/[0.05] ${
                      n ? 'border-white/[0.18] bg-white/[0.04]' : 'border-white/[0.08]'
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block hero-titulo text-xl leading-tight text-[#faf6ee] truncate">{e.nome}</span>
                      <span className="hero-mono text-[11px] text-slate-400">
                        {n ? `${n} ${n === 1 ? 'lugar' : 'lugares'}` : 'ver cidades'}
                      </span>
                    </span>
                    <span className="hero-titulo text-3xl text-[#f2a65a]/80 group-hover:text-[#f2a65a] transition">{e.uf}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
