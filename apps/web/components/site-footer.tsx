import Link from 'next/link';
import { PinMarca } from './site-nav';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__faixa" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr] items-start">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 hero-titulo text-2xl text-[#faf6ee] tracking-[-0.04em]">
            <span className="inline-flex h-6 text-[#f2a65a] [&_svg]:h-full [&_svg]:w-auto">
              <PinMarca />
            </span>
            SpotGuide
          </div>
          <p className="text-sm text-[#faf6ee]/60 max-w-sm leading-relaxed">
            Restaurantes, bares, hotéis e pontos turísticos perto de você, com rota e nota de quem foi.
          </p>
        </div>

        <nav className="space-y-3 text-sm" aria-label="Rodapé">
          <p className="hero-mono text-[11px] tracking-wide text-[#f2a65a]">[ explorar ]</p>
          <Link href="/locais" className="block text-[#faf6ee]/75 hover:text-[#faf6ee] transition">
            Todos os locais
          </Link>
          <Link href="/#cidades" className="block text-[#faf6ee]/75 hover:text-[#faf6ee] transition">
            Cidades
          </Link>
          <Link href="/login" className="block text-[#faf6ee]/75 hover:text-[#faf6ee] transition">
            Entrar
          </Link>
        </nav>

        <nav className="space-y-3 text-sm" aria-label="Para comerciantes">
          <p className="hero-mono text-[11px] tracking-wide text-[#f2a65a]">[ para comerciantes ]</p>
          <Link href="/comerciante" className="block text-[#faf6ee]/75 hover:text-[#faf6ee] transition">
            Painel do comerciante
          </Link>
          <Link href="/cadastro" className="block text-[#faf6ee]/75 hover:text-[#faf6ee] transition">
            Criar conta
          </Link>
        </nav>
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-8 hero-mono text-[11px] text-[#faf6ee]/40 flex flex-wrap justify-between gap-2">
        <span>SpotGuide✱ · Guia turístico e comercial</span>
        <span>© {new Date().getFullYear()} SpotGuide Brasil</span>
      </div>
    </footer>
  );
}
