import gsap from 'gsap';

/**
 * Transição "travessia das nuvens": a câmera desce em direção à ilha e camadas de nuvem sobem pela tela,
 * cobrindo tudo; a rota troca por trás delas, que seguem subindo e revelam a página nova.
 * Só transform e opacity (nada de clip-path ou filtro animado), então roda bem em celular.
 */

// [imagem, esquerda (vw), largura (vw)]: 4 faixas que se sobrepõem e cobrem a tela inteira
const FAIXAS: Array<{ topo: number; nuvens: Array<[string, number, number]> }> = [
  { topo: 4, nuvens: [['nuvem-3', -14, 80], ['nuvem-1', 40, 78], ['nuvem-6', 82, 60]] },
  { topo: 28, nuvens: [['nuvem-2', -8, 70], ['nuvem-4', 36, 80], ['nuvem-7', 76, 66]] },
  { topo: 50, nuvens: [['nuvem-1', -16, 84], ['nuvem-6', 38, 74], ['nuvem-3', 74, 80]] },
  { topo: 70, nuvens: [['nuvem-4', -10, 90], ['nuvem-2', 42, 80], ['nuvem-1', 80, 70]] },
];

const espera = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function abrirPortal(hero: HTMLElement, destino: string, ir: (href: string) => void) {
  const ilha = hero.querySelector<HTMLElement>('.ilha-box')?.getBoundingClientRect();
  if (!ilha || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return ir(destino);

  // montado no body, fora do hero (que some quando a rota troca), com cores fixas: os tokens de .hero não chegam aqui
  const veu = document.createElement('div');
  veu.setAttribute('aria-hidden', 'true');
  veu.style.cssText = 'position:fixed;inset:0;z-index:100;overflow:hidden;pointer-events:all';
  const fundo = document.createElement('div');
  fundo.style.cssText =
    'position:absolute;inset:0;opacity:0;background:linear-gradient(to bottom,#3b2a78,#d9697a 50%,#f3c9a0)';
  veu.appendChild(fundo);
  const faixas = FAIXAS.map(({ topo, nuvens }) => {
    const f = document.createElement('div');
    f.style.cssText = 'position:absolute;inset:0;will-change:transform;transform:translateY(115%)';
    for (const [src, left, w] of nuvens) {
      const img = new Image();
      img.src = `/img/${src}.webp`;
      img.alt = '';
      img.draggable = false;
      img.style.cssText = `position:absolute;left:${left}vw;top:${topo}vh;width:${w}vw;max-width:none;height:auto`;
      f.appendChild(img);
    }
    veu.appendChild(f);
    return f;
  });
  document.body.appendChild(veu);

  const origem = `${ilha.left + ilha.width / 2}px ${ilha.top + ilha.height / 2}px`;
  const camada = (n: string) => hero.querySelectorAll(`[data-in="${n}"]`);
  gsap.set(hero.querySelectorAll('[data-in="ilha"],[data-in="frente"],[data-in="horizonte"]'), { transformOrigin: origem });

  const rota = location.pathname;
  const rotaTrocou = async () => {
    const limite = Date.now() + 6000; // shortcut: se a rota nunca trocar, solta a tela depois de 6s
    while (location.pathname === rota && Date.now() < limite) await espera(50);
  };

  gsap
    .timeline()
    .to(hero.querySelector('.hero__ui'), { opacity: 0, duration: 0.4 }, 0)
    .to(hero.querySelector('.camada--chips'), { opacity: 0, duration: 0.4 }, 0)
    .to(camada('ilha'), { scale: 1.5, duration: 1.8, ease: 'power2.in' }, 0)
    .to(camada('horizonte'), { scale: 1.25, duration: 1.8, ease: 'power2.in' }, 0)
    .to(camada('frente'), { scale: 1.8, opacity: 0, duration: 1.2, ease: 'power2.in' }, 0.2)
    .to(fundo, { opacity: 1, duration: 1, ease: 'power2.in' }, 0.3)
    .to(faixas, { y: 0, yPercent: 0, duration: 1.3, ease: 'power3.out', stagger: 0.14 }, 0.2)
    .add(async () => {
      ir(destino);
      await rotaTrocou();
      // as nuvens seguem subindo e deixam a página nova aparecer
      gsap
        .timeline({ onComplete: () => veu.remove() })
        .to(faixas, { yPercent: -125, duration: 1.2, ease: 'power2.in', stagger: 0.1 }, 0)
        .to(fundo, { opacity: 0, duration: 0.8, ease: 'power1.inOut' }, 0.3);
    }, 1.95);
}
