/** Cursor (parallax) + saída no scroll, escritos por quadro só quando algo muda. */

const MAX_X = 26;
const MAX_Y = 14;

interface Camada {
  el: HTMLElement;
  prof: number;
  /** quanto sobe na saída (× altura do palco) */
  sobe: number;
  escala: number;
  x: number;
  y: number;
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const suave = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export function iniciarPalco(hero: HTMLElement): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

  const todas = (s: string) => Array.from(hero.querySelectorAll<HTMLElement>(s));
  const um = (s: string) => hero.querySelector<HTMLElement>(s);

  const camadas: Camada[] = todas('[data-camada]').map((el) => ({
    el,
    prof: Number(el.dataset.prof ?? 0),
    sobe: Number(el.dataset.sobe ?? 0),
    escala: Number(el.dataset.escala ?? 1),
    x: 0,
    y: 0,
  }));
  const ilha = um('[data-camada="ilha"]');
  const texto = um('[data-saida="texto"]');
  const hud = um('[data-saida="hud"]');
  const veu = um('[data-saida="veu"]');
  const fileiras = todas('[data-muro]');

  let alvoX = 0;
  let alvoY = 0;
  let p = 0;
  let pAlvo = 0;
  let raf = 0;
  let visivel = true;

  const escrito = { transform: new WeakMap<HTMLElement, string>(), opacity: new WeakMap<HTMLElement, string>() };
  const set = (el: HTMLElement | null, prop: 'transform' | 'opacity', v: string) => {
    if (!el || escrito[prop].get(el) === v) return;
    el.style[prop] = v;
    escrito[prop].set(el, v);
  };

  const agenda = () => {
    if (!raf && visivel) raf = requestAnimationFrame(quadro);
  };

  const quadro = () => {
    raf = 0;
    const H = window.innerHeight;
    p += (pAlvo - p) * 0.12;
    if (Math.abs(pAlvo - p) < 0.0005) p = pAlvo;

    let movendo = p !== pAlvo;
    for (const c of camadas) {
      const dx = -alvoX * MAX_X * c.prof - c.x;
      const dy = -alvoY * MAX_Y * c.prof - c.y;
      c.x += dx * 0.05;
      c.y += dy * 0.05;
      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) movendo = true;
      const esc = 1 + (c.escala - 1) * p;
      set(
        c.el,
        'transform',
        `translate3d(${c.x.toFixed(2)}px, ${(c.y - p * c.sobe * H).toFixed(2)}px, 0) scale(${esc.toFixed(4)})`
      );
    }

    set(ilha, 'opacity', (1 - suave(0.28, 0.58, p)).toFixed(3));
    set(texto, 'opacity', clamp(1 - p / 0.3).toFixed(3));
    set(hud, 'opacity', clamp(1 - p / 0.22).toFixed(3));
    set(veu, 'opacity', (clamp((p - 0.45) / 0.5) * 0.62).toFixed(3));
    set(texto, 'transform', `translate3d(0, ${(-p * H * 0.45).toFixed(1)}px, 0)`);
    for (const f of fileiras) {
      set(f, 'transform', `translate3d(0, ${(-p * Number(f.dataset.muro) * H).toFixed(1)}px, 0)`);
    }

    if (movendo) raf = requestAnimationFrame(quadro);
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    alvoX = (e.clientX / window.innerWidth - 0.5) * 2;
    alvoY = (e.clientY / window.innerHeight - 0.5) * 2;
    agenda();
  };
  const onScroll = () => {
    const topo = hero.getBoundingClientRect().top + window.scrollY;
    pAlvo = clamp((window.scrollY - topo) / window.innerHeight);
    agenda();
  };

  const io = new IntersectionObserver(([e]) => {
    visivel = e.isIntersecting;
    hero.dataset.visivel = String(visivel);
    if (visivel) agenda();
  });
  io.observe(hero);

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
}
