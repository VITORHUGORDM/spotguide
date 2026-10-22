import gsap from 'gsap';

/**
 * Transição "portal": a câmera mergulha na ilha (cada camada de nuvem escala numa velocidade, o que dá
 * profundidade) enquanto uma janela arredondada, do tamanho da ilha, se abre até a tela cheia com a luz do
 * pôr do sol; a luz se apaga no fundo escuro de /locais, e só então a rota troca. O véu fica até a página nova existir.
 */
export function abrirPortal(hero: HTMLElement, destino: string, ir: (href: string) => void) {
  const ilha = hero.querySelector<HTMLElement>('.ilha-box')?.getBoundingClientRect();
  if (!ilha || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return ir(destino);

  const { innerWidth: W, innerHeight: H } = window;
  const dentro = `inset(${Math.max(0, ilha.top)}px ${Math.max(0, W - ilha.right)}px ${Math.max(0, H - ilha.bottom)}px ${Math.max(0, ilha.left)}px round 90px)`;
  const origem = `${ilha.left + ilha.width / 2}px ${ilha.top + ilha.height / 2}px`;

  const veu = document.createElement('div');
  veu.setAttribute('aria-hidden', 'true');
  veu.style.cssText = `position:fixed;inset:0;z-index:100;pointer-events:all;background:var(--fundo);clip-path:${dentro}`;
  const brilho = document.createElement('div');
  brilho.style.cssText =
    'position:absolute;inset:0;background:radial-gradient(circle at 50% 55%,var(--creme),var(--ceu-4) 32%,var(--ceu-2) 72%,var(--ceu-1))';
  veu.appendChild(brilho);
  document.body.appendChild(veu);

  const camada = (n: string) => hero.querySelectorAll(`[data-in="${n}"]`);
  gsap.set(hero.querySelectorAll('[data-in="ilha"],[data-in="frente"],[data-in="horizonte"],[data-in="longe"]'), {
    transformOrigin: origem,
  });

  const rota = location.pathname;
  const sai = () => {
    if (location.pathname === rota) return requestAnimationFrame(sai);
    gsap.to(veu, { opacity: 0, duration: 0.6, ease: 'power2.out', onComplete: () => veu.remove() });
  };

  // câmera lenta no começo (power3.in) e mais rápida perto do fim, como quem cai para dentro da ilha
  gsap
    .timeline({
      onComplete: () => {
        ir(destino);
        sai();
        setTimeout(() => veu.remove(), 6000); // shortcut: se a rota nunca trocar, solta a tela depois de 6s
      },
    })
    .to(hero.querySelector('.hero__ui'), { opacity: 0, filter: 'blur(8px)', duration: 0.5 }, 0)
    .to(hero.querySelector('.camada--chips'), { opacity: 0, duration: 0.5 }, 0)
    .to(camada('ilha'), { scale: 2.4, duration: 2.1, ease: 'power3.in' }, 0)
    .to(camada('horizonte'), { scale: 1.7, duration: 2.1, ease: 'power3.in' }, 0)
    .to(camada('longe'), { scale: 1.3, duration: 2.1, ease: 'power3.in' }, 0)
    .to(camada('frente'), { scale: 2.6, opacity: 0, duration: 1.9, ease: 'power3.in' }, 0.2)
    .to(veu, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 1.5, ease: 'power3.inOut' }, 0.6)
    .to(brilho, { opacity: 0, duration: 0.7, ease: 'power2.inOut' }, 1.7);
}
