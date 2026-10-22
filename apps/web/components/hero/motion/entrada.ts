import gsap from 'gsap';
import { contarHud, type AlvoHud, type ElsHud } from './hud';

const espera = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Espera ilha, nuvens e fontes (no máximo 1,8s; depois disso entra com o que já carregou). */
export async function aguardaRecursos(hero: HTMLElement) {
  const imgs = Array.from(hero.querySelectorAll<HTMLImageElement>('img'));
  const carregadas = Promise.all(imgs.map((i) => (i.complete ? Promise.resolve() : i.decode().catch(() => {}))));
  await Promise.race([Promise.all([carregadas, document.fonts.ready]), espera(1800)]);
}

export function criarEntrada(hero: HTMLElement, hud: ElsHud, alvo: AlvoHud): gsap.core.Timeline {
  const q = (s: string) => Array.from(hero.querySelectorAll<HTMLElement>(s));
  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => {
      hero.dataset.entrada = 'feita';
    },
  });

  tl.to(q('[data-entrada-veu]'), { opacity: 0, duration: 1.6, ease: 'power2.inOut' }, 0.1)
    .fromTo(q('[data-in="ceu"]'), { opacity: 0 }, { opacity: 1, duration: 1.4 }, 0)
    .fromTo(
      q('[data-in="longe"], [data-in="horizonte"]'),
      { opacity: 0, yPercent: 6 },
      { opacity: 1, yPercent: 0, duration: 1.8, stagger: 0.25 },
      0.3
    )
    .fromTo(
      q('[data-in="ilha"]'),
      { opacity: 0, yPercent: 20, scale: 0.94 },
      { opacity: 1, yPercent: 0, scale: 1, duration: 2.5 },
      0.5
    )
    .fromTo(q('[data-in="frente"]'), { opacity: 0, yPercent: 8 }, { opacity: 1, yPercent: 0, duration: 2 }, 1.1)
    .fromTo(q('.hero__letra'), { yPercent: 115, visibility: 'visible' }, { yPercent: 0, visibility: 'visible', duration: 1.1, stagger: 0.065 }, 1.5)
    .fromTo(
      q('[data-in="pin"]'),
      { opacity: 0, rotate: -80, scale: 0.4 },
      { opacity: 1, rotate: 0, scale: 1, duration: 1.1, ease: 'back.out(1.8)' },
      2.1
    )
    .fromTo(q('.hero__linha-in'), { yPercent: 110, visibility: 'visible' }, { yPercent: 0, visibility: 'visible', duration: 0.9, stagger: 0.12 }, 2.1)
    .fromTo(q('[data-in="fade"]'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 2.5)
    .add(contarHud(hud, alvo), 1.9);

  return tl;
}
