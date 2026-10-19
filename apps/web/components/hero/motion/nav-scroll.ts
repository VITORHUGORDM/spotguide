/** A barra some ao descer e volta ao subir; no topo e com foco fica sempre visível. */
export function iniciarNavScroll(nav: HTMLElement): () => void {
  let ultimo = window.scrollY;
  let acumulado = 0;

  const atualiza = () => {
    const y = window.scrollY;
    const delta = y - ultimo;
    ultimo = y;
    acumulado = Math.sign(delta) === Math.sign(acumulado) ? acumulado + delta : delta;

    if (y < 24 || nav.matches(':focus-within') || acumulado < -6) nav.dataset.oculta = 'false';
    else if (acumulado > 10) nav.dataset.oculta = 'true';
  };

  const aoFocar = () => (nav.dataset.oculta = 'false');
  window.addEventListener('scroll', atualiza, { passive: true });
  nav.addEventListener('focusin', aoFocar);
  return () => {
    window.removeEventListener('scroll', atualiza);
    nav.removeEventListener('focusin', aoFocar);
  };
}
