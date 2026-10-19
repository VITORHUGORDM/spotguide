'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { iniciarNavScroll } from './hero/motion/nav-scroll';
import './site-nav.css';

export function PinMarca() {
  return (
    <svg viewBox="0 0 24 32" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 0C5.4 0 0 5.3 0 11.8 0 20.5 12 32 12 32s12-11.5 12-20.2C24 5.3 18.6 0 12 0Zm0 7.2a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2Z"
      />
    </svg>
  );
}

/** Barra flutuante única do site: some ao descer, volta ao subir. */
export function SiteNav() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const home = pathname === '/';

  useEffect(() => (ref.current ? iniciarNavScroll(ref.current) : undefined), []);

  const atual = (href: string) => (pathname.startsWith(href) ? 'page' : undefined);

  return (
    <>
      <div ref={ref} className="site-nav-wrap" data-oculta="false" data-home={home}>
        <nav className="site-nav" aria-label="Principal">
          {!home && (
            <Link href="/" className="site-nav__marca" aria-label="SpotGuide, página inicial">
              <PinMarca />
              <span>SpotGuide</span>
            </Link>
          )}
          <Link href="/locais" aria-current={atual('/locais')}>
            Locais
          </Link>
          <Link href={home ? '#cidades' : '/#cidades'}>Cidades</Link>
          <Link href="/comerciante" aria-current={atual('/comerciante')}>
            Sou comerciante
          </Link>
          {!isLoading &&
            (user ? (
              <button type="button" onClick={logout} title="Sair">
                {user.name.split(' ')[0]} · Sair
              </button>
            ) : (
              <Link href="/login" aria-current={atual('/login')}>
                Entrar
              </Link>
            ))}
        </nav>
      </div>
      {!home && <div className="site-nav-espaco" aria-hidden="true" />}
    </>
  );
}
