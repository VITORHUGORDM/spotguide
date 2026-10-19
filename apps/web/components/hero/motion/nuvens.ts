import type { CSSProperties } from 'react';
import type { Nuvem } from '../../../lib/hero-data';

/** Posiciona uma nuvem por variáveis CSS; a deriva e o layout do celular ficam no hero.css. */
export function estiloNuvem(n: Nuvem): CSSProperties {
  const v: Record<string, string | number> = {
    '--w': `${n.w}vw`,
    '--y': `${n.y}%`,
    '--r': n.r,
    '--dur': `${n.dur}s`,
    // atraso negativo: a nuvem já começa no meio da travessia
    '--atraso': `${-(n.dur * n.fase).toFixed(1)}s`,
  };
  if (n.wm !== undefined) v['--wm'] = `${n.wm}vw`;
  if (n.ym !== undefined) v['--ym'] = `${n.ym}%`;
  return v as CSSProperties;
}

export const nuvensDa = (lista: Nuvem[], camada: Nuvem['camada']) => lista.filter((n) => n.camada === camada);
