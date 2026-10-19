import gsap from 'gsap';

export interface AlvoHud {
  lugares: number;
  nota: number;
  avaliacoes: number;
}

export interface ElsHud {
  hora: HTMLElement;
  lugares: HTMLElement;
  nota: HTMLElement;
  avaliacoes: HTMLElement;
}

const HORA_FINAL = 18 * 60 + 40;
const pad = (n: number) => String(n).padStart(2, '0');
export const formataHora = (min: number) => `${pad(Math.floor(min / 60) % 24)}:${pad(Math.floor(min) % 60)}`;
const formataNota = (n: number) => n.toFixed(1).replace('.', ',');

export function pintaHud(els: ElsHud, alvo: AlvoHud, min = HORA_FINAL, frac = 1) {
  els.hora.textContent = formataHora(min);
  els.lugares.textContent = String(Math.round(alvo.lugares * frac));
  els.nota.textContent = formataNota(alvo.nota * frac);
  els.avaliacoes.textContent = String(Math.round(alvo.avaliacoes * frac));
}

/** Conta do início ao valor final em 1,9s (relógio de 17:40 a 18:40). */
export function contarHud(els: ElsHud, alvo: AlvoHud): gsap.core.Tween {
  const estado = { t: 0 };
  return gsap.to(estado, {
    t: 1,
    duration: 1.9,
    ease: 'power2.out',
    onUpdate: () => pintaHud(els, alvo, HORA_FINAL - 60 * (1 - estado.t), estado.t),
    onComplete: () => pintaHud(els, alvo),
  });
}

/** Depois da entrada: o relógio anda em tempo real a partir de 18:40. */
export function iniciarHudVivo(els: ElsHud): () => void {
  const inicio = performance.now();
  const id = window.setInterval(() => {
    els.hora.textContent = formataHora(HORA_FINAL + (performance.now() - inicio) / 60000);
  }, 1000);
  return () => window.clearInterval(id);
}
