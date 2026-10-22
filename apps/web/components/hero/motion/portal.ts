import gsap from 'gsap';

/**
 * Transição "portal": uma janela arredondada, do tamanho da ilha, se abre até cobrir a tela
 * (a interface do hero some com blur) e só então a rota troca. O véu fica até a página nova existir.
 */
export function abrirPortal(hero: HTMLElement, destino: string, ir: (href: string) => void) {
  const origem = hero.querySelector<HTMLElement>('.ilha-box')?.getBoundingClientRect();
  if (!origem || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return ir(destino);

  const { innerWidth: W, innerHeight: H } = window;
  const dentro = `inset(${Math.max(0, origem.top)}px ${Math.max(0, W - origem.right)}px ${Math.max(0, H - origem.bottom)}px ${Math.max(0, origem.left)}px round 90px)`;

  const veu = document.createElement('div');
  veu.setAttribute('aria-hidden', 'true');
  veu.style.cssText = `position:fixed;inset:0;z-index:100;pointer-events:all;clip-path:${dentro};` +
    'background:linear-gradient(to bottom,var(--ceu-1),var(--ceu-3) 55%,var(--ceu-4))';
  document.body.appendChild(veu);

  const rota = location.pathname;
  const sai = () => {
    if (location.pathname === rota) return requestAnimationFrame(sai);
    gsap.to(veu, { opacity: 0, duration: 0.6, ease: 'power2.out', onComplete: () => veu.remove() });
  };

  gsap.to(hero.querySelector('.hero__ui'), { opacity: 0, filter: 'blur(8px)', duration: 0.45 });
  gsap.to(veu, {
    clipPath: 'inset(0px 0px 0px 0px round 0px)',
    duration: 1.1,
    ease: 'power3.inOut',
    onComplete: () => {
      ir(destino);
      sai();
      setTimeout(() => veu.remove(), 6000); // shortcut: se a rota nunca trocar, solta a tela depois de 6s
    },
  });
}
