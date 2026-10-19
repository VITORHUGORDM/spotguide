/** Grão de filme único por cima da página: ladrilho de ruído de 180px em canvas. */
export function criarGrao(): () => void {
  const lado = 180;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = lado;
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const img = ctx.createImageData(lado, lado);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 90 + Math.random() * 110;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  const el = document.createElement('div');
  el.className = 'hero-grao';
  el.setAttribute('aria-hidden', 'true');
  el.style.backgroundImage = `url(${canvas.toDataURL('image/png')})`;
  document.body.appendChild(el);
  return () => el.remove();
}
