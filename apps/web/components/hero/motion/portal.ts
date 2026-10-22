import gsap from 'gsap';

const espera = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const FECHADO = 'inset(50% 50% 50% 50% round 90px)';

let quadro: { src: string; el: HTMLIFrameElement; pronto: Promise<void> } | null = null;

/**
 * Carrega o destino de verdade, escondido, para o portal mostrar a página e não uma cor. Chamado no hover:
 * quando o clique chega, a página já está pronta. Sem uso em 20s, sai.
 */
export function preparaPortal(destino: string) {
  if (quadro?.src === destino) return quadro;
  quadro?.el.remove();
  const el = document.createElement('iframe');
  el.src = destino;
  el.tabIndex = -1;
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText = `position:fixed;inset:0;width:100%;height:100%;border:0;z-index:100;pointer-events:none;background:var(--fundo);clip-path:${FECHADO}`;
  const pronto = new Promise<void>((r) => el.addEventListener('load', () => r(), { once: true }));
  document.body.appendChild(el);
  const atual = (quadro = { src: destino, el, pronto });
  setTimeout(() => {
    if (quadro === atual && el.style.clipPath === FECHADO) {
      el.remove();
      quadro = null;
    }
  }, 20000);
  return atual;
}

/**
 * Transição "portal": a câmera mergulha na ilha (cada camada de nuvem escala numa velocidade, o que dá
 * profundidade) e uma janela arredondada, do tamanho da ilha, se abre mostrando a própria página de destino
 * até a tela cheia. Só então a rota troca (a página é a mesma, então não há corte) e a janela sai.
 */
export function abrirPortal(hero: HTMLElement, destino: string, ir: (href: string) => void) {
  const ilha = hero.querySelector<HTMLElement>('.ilha-box')?.getBoundingClientRect();
  if (!ilha || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return ir(destino);

  const { innerWidth: W, innerHeight: H } = window;
  const dentro = `inset(${Math.max(0, ilha.top)}px ${Math.max(0, W - ilha.right)}px ${Math.max(0, H - ilha.bottom)}px ${Math.max(0, ilha.left)}px round 90px)`;
  const origem = `${ilha.left + ilha.width / 2}px ${ilha.top + ilha.height / 2}px`;

  const { el: janela, pronto } = preparaPortal(destino);
  janela.style.pointerEvents = 'all'; // segura cliques durante a viagem
  janela.style.clipPath = dentro;

  const camada = (n: string) => hero.querySelectorAll(`[data-in="${n}"]`);
  gsap.set(hero.querySelectorAll('[data-in="ilha"],[data-in="frente"],[data-in="horizonte"],[data-in="longe"]'), {
    transformOrigin: origem,
  });

  const rota = location.pathname;
  const sai = () => {
    if (location.pathname === rota) return requestAnimationFrame(sai);
    gsap.to(janela, { opacity: 0, duration: 0.5, ease: 'power2.out', onComplete: () => { janela.remove(); quadro = null; } });
  };

  // câmera lenta no começo (power3.in) e mais rápida perto do fim, como quem cai para dentro da ilha
  gsap
    .timeline()
    .to(hero.querySelector('.hero__ui'), { opacity: 0, filter: 'blur(8px)', duration: 0.5 }, 0)
    .to(hero.querySelector('.camada--chips'), { opacity: 0, duration: 0.5 }, 0)
    .to(camada('ilha'), { scale: 2.4, duration: 2.1, ease: 'power3.in' }, 0)
    .to(camada('horizonte'), { scale: 1.7, duration: 2.1, ease: 'power3.in' }, 0)
    .to(camada('longe'), { scale: 1.3, duration: 2.1, ease: 'power3.in' }, 0)
    .to(camada('frente'), { scale: 2.6, opacity: 0, duration: 1.9, ease: 'power3.in' }, 0.2);

  // a janela só abre depois do primeiro instante da viagem e com a página carregada (no máximo 3s de espera)
  Promise.all([Promise.race([pronto, espera(3000)]), espera(600)]).then(() =>
    gsap.to(janela, {
      clipPath: 'inset(0px 0px 0px 0px round 0px)',
      duration: 1.5,
      ease: 'power3.inOut',
      onComplete: () => {
        ir(destino);
        sai();
        setTimeout(() => { janela.remove(); quadro = null; }, 6000); // shortcut: se a rota nunca trocar, solta a tela depois de 6s
      },
    })
  );
}
