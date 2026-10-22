import gsap from 'gsap';

/**
 * Transição "portal": a câmera mergulha na ilha (cada camada de nuvem escala numa velocidade, o que dá
 * profundidade) e uma janela arredondada, do tamanho da ilha, se abre mostrando a cena da cidade até a tela
 * cheia. Só então a rota troca, e a janela sai em fade quando a página nova existe.
 */
export function abrirPortal(hero: HTMLElement, janela: HTMLElement, destino: string, ir: (href: string) => void) {
  const ilha = hero.querySelector<HTMLElement>('.ilha-box')?.getBoundingClientRect();
  if (!ilha || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return ir(destino);

  const { innerWidth: W, innerHeight: H } = window;
  const dentro = `inset(${Math.max(0, ilha.top)}px ${Math.max(0, W - ilha.right)}px ${Math.max(0, H - ilha.bottom)}px ${Math.max(0, ilha.left)}px round 90px)`;
  const origem = `${ilha.left + ilha.width / 2}px ${ilha.top + ilha.height / 2}px`;
  const arte = janela.querySelector('.portal-janela__arte');
  const rotulo = janela.querySelector('.portal-janela__rotulo');

  janela.style.pointerEvents = 'all'; // segura cliques durante a viagem
  gsap.set(janela, { clipPath: dentro, opacity: 1 });
  gsap.set(arte, { scale: 1.5 });
  gsap.set(rotulo, { opacity: 0, y: 16 });

  const camada = (n: string) => hero.querySelectorAll(`[data-in="${n}"]`);
  gsap.set(hero.querySelectorAll('[data-in="ilha"],[data-in="frente"],[data-in="horizonte"],[data-in="longe"]'), {
    transformOrigin: origem,
  });

  const rota = location.pathname;
  const fecha = () => {
    gsap.set(janela, { clipPath: 'inset(50% 50% 50% 50% round 90px)', pointerEvents: 'none' });
  };
  const sai = () => {
    if (location.pathname === rota) return requestAnimationFrame(sai);
    gsap.to(janela, { opacity: 0, duration: 0.5, ease: 'power2.out', onComplete: fecha });
  };

  // câmera lenta no começo (power3.in) e mais rápida perto do fim, como quem cai para dentro da ilha
  gsap
    .timeline()
    .to(hero.querySelector('.hero__ui'), { opacity: 0, filter: 'blur(8px)', duration: 0.5 }, 0)
    .to(hero.querySelector('.camada--chips'), { opacity: 0, duration: 0.5 }, 0)
    .to(camada('ilha'), { scale: 2.4, duration: 2.1, ease: 'power3.in' }, 0)
    .to(camada('horizonte'), { scale: 1.7, duration: 2.1, ease: 'power3.in' }, 0)
    .to(camada('longe'), { scale: 1.3, duration: 2.1, ease: 'power3.in' }, 0)
    .to(camada('frente'), { scale: 2.6, opacity: 0, duration: 1.9, ease: 'power3.in' }, 0.2)
    .to(janela, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 1.5, ease: 'power3.inOut' }, 0.5)
    .to(arte, { scale: 1, duration: 1.8, ease: 'power2.out' }, 0.5) // a cena "assenta" enquanto a janela abre
    .to(rotulo, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 1.5)
    .add(() => {
      ir(destino);
      sai();
      setTimeout(fecha, 6000); // shortcut: se a rota nunca trocar, solta a tela depois de 6s
    }, 2.1);
}
