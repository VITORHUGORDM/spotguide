export type CamadaNuvem = 'longe' | 'horizonte' | 'frente';

export interface Nuvem {
  src: string;
  /** altura / largura da imagem */
  r: number;
  camada: CamadaNuvem;
  /** largura em vw e centro vertical em % do palco (desktop) */
  w: number;
  y: number;
  /** layout do celular; sem `wm`, usa o desktop. `oculta` esconde no celular */
  wm?: number;
  ym?: number;
  oculta?: boolean;
  espelha?: boolean;
  /** segundos para atravessar a tela e ponto de partida (0–1) */
  dur: number;
  fase: number;
  filtro?: string;
}

const f = (w: number, h: number) => h / w;
const R = {
  n1: f(1110, 240),
  n2: f(350, 211),
  n3: f(705, 369),
  n4: f(434, 255),
  n6: f(1208, 246),
  n7: f(279, 210),
};

export const NUVENS: Nuvem[] = [
  // de longe: pequenas, frias, no céu dos dois lados da ilha
  { src: 'nuvem-2', r: R.n2, camada: 'longe', w: 17, y: 13, wm: 34, ym: 8, dur: 300, fase: 0.12 },
  { src: 'nuvem-7', r: R.n7, camada: 'longe', w: 12, y: 27, wm: 26, ym: 20, dur: 360, fase: 0.62, espelha: true },
  { src: 'nuvem-4', r: R.n4, camada: 'longe', w: 19, y: 7, oculta: true, dur: 420, fase: 0.85 },
  { src: 'nuvem-1', r: R.n1, camada: 'longe', w: 34, y: 41, wm: 70, ym: 50, dur: 340, fase: 0.4, espelha: true },
  // mar de nuvens do horizonte
  { src: 'nuvem-3', r: R.n3, camada: 'horizonte', w: 24, y: 66, wm: 52, ym: 58, dur: 250, fase: 0.08 },
  { src: 'nuvem-6', r: R.n6, camada: 'horizonte', w: 58, y: 75, wm: 120, ym: 66, dur: 290, fase: 0.55 },
  { src: 'nuvem-1', r: R.n1, camada: 'horizonte', w: 52, y: 80, wm: 110, ym: 72, dur: 270, fase: 0.9, espelha: true },
  // da frente: passam sobre a base da ilha e atrás do nome
  { src: 'nuvem-6', r: R.n6, camada: 'frente', w: 66, y: 87, wm: 135, ym: 82, dur: 190, fase: 0.3, espelha: true },
  { src: 'nuvem-3', r: R.n3, camada: 'frente', w: 30, y: 91, wm: 68, ym: 88, dur: 210, fase: 0.75 },
  { src: 'nuvem-1', r: R.n1, camada: 'frente', w: 60, y: 96, wm: 120, ym: 94, dur: 170, fase: 0.02 },
];

/** muro de nuvens da saída: três fileiras sobrepostas, de baixo para cima */
export interface MuroNuvem {
  src: string;
  r: number;
  w: number;
  x: number;
  espelha?: boolean;
  /** deslocamento vertical dentro da fileira, em svh */
  dy?: number;
}

export const MURO: MuroNuvem[][] = [
  [
    { src: 'nuvem-6', r: R.n6, w: 80, x: 2 },
    { src: 'nuvem-1', r: R.n1, w: 76, x: 38, espelha: true },
    { src: 'nuvem-3', r: R.n3, w: 46, x: 70 },
    { src: 'nuvem-3', r: R.n3, w: 38, x: -6, dy: 12, espelha: true },
    { src: 'nuvem-6', r: R.n6, w: 70, x: 44, dy: 18 },
    { src: 'nuvem-1', r: R.n1, w: 60, x: 12, dy: 30, espelha: true },
  ],
  [
    { src: 'nuvem-1', r: R.n1, w: 78, x: -8 },
    { src: 'nuvem-6', r: R.n6, w: 84, x: 30, espelha: true },
    { src: 'nuvem-3', r: R.n3, w: 50, x: 74, espelha: true },
    { src: 'nuvem-3', r: R.n3, w: 42, x: 20, dy: 14 },
    { src: 'nuvem-1', r: R.n1, w: 70, x: 56, dy: 22 },
    { src: 'nuvem-6', r: R.n6, w: 76, x: -12, dy: 32, espelha: true },
  ],
  [
    { src: 'nuvem-6', r: R.n6, w: 90, x: 6, espelha: true },
    { src: 'nuvem-3', r: R.n3, w: 52, x: 48 },
    { src: 'nuvem-1', r: R.n1, w: 80, x: 60 },
    { src: 'nuvem-1', r: R.n1, w: 74, x: -10, dy: 16 },
    { src: 'nuvem-3', r: R.n3, w: 44, x: 62, dy: 20, espelha: true },
    { src: 'nuvem-6', r: R.n6, w: 86, x: 24, dy: 34 },
  ],
];

/** valores de exemplo do HUD, usados enquanto a API não responde */
export const HUD_PADRAO = {
  lugares: 12,
  nota: 4.7,
  avaliacoes: 340,
};

/** categorias que orbitam a ilha (somem no celular) */
export const CHIPS = [
  { nome: 'Restaurantes', slug: 'restaurantes', icone: 'utensils', pos: { left: '8%', top: '25%' }, atraso: 0 },
  { nome: 'Cafés', slug: 'cafes', icone: 'coffee', pos: { left: '14%', top: '44%' }, atraso: -1.4 },
  { nome: 'Bares', slug: 'bares', icone: 'beer', pos: { left: '7%', top: '61%' }, atraso: -2.6 },
  { nome: 'Hotéis', slug: 'hospedagem', icone: 'hotel', pos: { right: '8%', top: '28%' }, atraso: -0.7 },
  { nome: 'Pontos turísticos', slug: 'turismo', icone: 'camera', pos: { right: '13%', top: '47%' }, atraso: -2 },
  { nome: 'Comércio', slug: 'comercio', icone: 'shopping', pos: { right: '6%', top: '63%' }, atraso: -3.2 },
] as const;
