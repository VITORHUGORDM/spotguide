/**
 * Cartões de cidade ilustrados no mesmo pôr do sol do hero.
 * Cada cidade é um céu próprio com silhuetas em camadas (sem fotos externas).
 */
import type { ReactNode } from 'react';

interface Cena {
  ceu: [string, string, string];
  sol: { x: number; y: number; r: number; cor: string };
  corpo: ReactNode;
}

const Pinheiro = ({ x, y, h, c = '#1a1238' }: { x: number; y: number; h: number; c?: string }) => {
  const w = h * 0.36;
  return (
    <g fill={c}>
      <path d={`M${x} ${y - h} l${w * 0.5} ${h * 0.34} h${-w * 0.22} l${w * 0.4} ${h * 0.3} h${-w * 0.2} l${w * 0.5} ${h * 0.36} h${-w * 2.96 + w * 0.0} l${w * 0.5} ${-h * 0.36} h${-w * 0.2} l${w * 0.4} ${-h * 0.3} h${-w * 0.22}Z`} transform={`translate(0 0)`} />
      <rect x={x - 2} y={y - 2} width="4" height="8" />
    </g>
  );
};

const Araucaria = ({ x, y, h, c = '#1a1238' }: { x: number; y: number; h: number; c?: string }) => (
  <g fill={c}>
    <rect x={x - 2.4} y={y - h} width="4.8" height={h} />
    <path d={`M${x - h * 0.55} ${y - h} q${h * 0.55} ${-h * 0.34} ${h * 1.1} 0 q${-h * 0.55} ${-h * 0.14} ${-h * 1.1} 0Z`} />
    <path d={`M${x - h * 0.34} ${y - h * 0.7} q${h * 0.34} ${-h * 0.22} ${h * 0.68} 0 q${-h * 0.34} ${-h * 0.1} ${-h * 0.68} 0Z`} />
  </g>
);

const Serra = ({ y, cor, op = 1 }: { y: number; cor: string; op?: number }) => (
  <path
    opacity={op}
    fill={cor}
    d={`M0 ${y} l40 -34 l36 22 l52 -52 l44 36 l46 -24 l60 50 l48 -30 l74 40 V300 H0Z`}
  />
);

const CENAS: Record<string, Cena> = {
  gramado: {
    ceu: ['#2a2060', '#a8528a', '#f2a65a'],
    sol: { x: 300, y: 118, r: 30, cor: '#ffe0a6' },
    corpo: (
      <>
        <Serra y={188} cor="#5b3a86" op={0.7} />
        <Serra y={214} cor="#3b2a78" />
        {[20, 58, 96, 140, 250, 292, 336, 376].map((x, i) => (
          <Pinheiro key={x} x={x} y={262} h={70 + (i % 3) * 18} c={i % 2 ? '#150e30' : '#1a1238'} />
        ))}
        <path d="M150 262 v-46 l30 -26 l30 26 v46Z" fill="#150e30" />
        <rect x="170" y="236" width="16" height="14" fill="#ffd36b" />
        <rect x="192" y="236" width="10" height="26" fill="#ffd36b" opacity=".8" />
        <rect x="196" y="186" width="9" height="20" fill="#150e30" />
        <rect x="0" y="262" width="400" height="38" fill="#0f0a24" />
      </>
    ),
  },
  'campos-do-jordao': {
    ceu: ['#1b1647', '#6a4a96', '#e98d6e'],
    sol: { x: 90, y: 130, r: 22, cor: '#ffd9a8' },
    corpo: (
      <>
        <Serra y={170} cor="#4b3586" op={0.75} />
        <path d="M0 230 Q120 190 220 222 T400 206 V300 H0Z" fill="#2a1d5e" />
        {[40, 74, 118, 196, 262, 318, 360].map((x, i) => (
          <Araucaria key={x} x={x} y={262 - (i % 2) * 8} h={64 + (i % 3) * 16} c={i % 2 ? '#150e30' : '#1d1440'} />
        ))}
        <path d="M0 262 Q140 246 260 262 T400 258 V300 H0Z" fill="#0f0a24" />
      </>
    ),
  },
  florianopolis: {
    ceu: ['#2b2a78', '#c85c82', '#ffb066'],
    sol: { x: 200, y: 168, r: 34, cor: '#fff0c2' },
    corpo: (
      <>
        <path d="M0 196 Q60 176 120 196 Q180 188 240 198 Q320 180 400 198 V300 H0Z" fill="#3b2a78" opacity=".8" />
        <path d="M0 214 H400 V300 H0Z" fill="#26194f" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={170 - i * 12} y={214 + i * 11} width={60 + i * 24} height="3" fill="#ffd9a8" opacity={0.5 - i * 0.08} />
        ))}
        {/* ponte pênsil */}
        <g stroke="#150e30" strokeWidth="3" fill="none">
          <path d="M0 232 H400" />
          <path d="M60 232 Q130 168 200 232 Q270 168 340 232" />
          <path d="M60 232 V196 M200 232 V196 M340 232 V196" strokeWidth="4" />
        </g>
        <path d="M290 300 Q320 246 364 250 Q400 252 400 300Z" fill="#150e30" />
        <g stroke="#150e30" strokeWidth="3" fill="none">
          <path d="M338 262 q4 -30 -2 -52" />
          <path d="M336 212 q-20 -8 -34 6 M336 212 q16 -14 36 -4 M336 212 q-6 -18 14 -24" />
        </g>
      </>
    ),
  },
  'rio-de-janeiro': {
    ceu: ['#27206a', '#d9697a', '#ffc27a'],
    sol: { x: 318, y: 110, r: 26, cor: '#ffe9b8' },
    corpo: (
      <>
        <Serra y={196} cor="#4b3586" op={0.6} />
        <path d="M110 250 Q130 168 180 156 Q212 150 232 190 Q250 220 262 250Z" fill="#26194f" />
        <path d="M30 250 Q50 200 92 196 Q120 200 130 250Z" fill="#1a1238" />
        <path d="M70 198 h4 v-16 h-4Z M64 186 h16" stroke="#1a1238" strokeWidth="3" />
        <path d="M0 250 H400 V300 H0Z" fill="#150e30" />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={250 + i * 14} y={260 + i * 10} width={110 - i * 20} height="2.5" fill="#ffd9a8" opacity={0.5 - i * 0.12} />
        ))}
      </>
    ),
  },
  'porto-alegre': {
    ceu: ['#1f2565', '#8a4a8f', '#f08a5a'],
    sol: { x: 130, y: 196, r: 38, cor: '#ffd9a0' },
    corpo: (
      <>
        {[
          [40, 40, 62],
          [86, 30, 90],
          [124, 36, 50],
          [250, 34, 74],
          [290, 26, 104],
          [324, 40, 58],
          [362, 30, 80],
        ].map(([x, w, h], i) => (
          <g key={i}>
            <rect x={x} y={236 - h} width={w} height={h} fill="#150e30" />
            {Array.from({ length: Math.floor(h / 16) }, (_, j) => (
              <rect key={j} x={x + 6} y={236 - h + 8 + j * 16} width={w - 12} height="3" fill="#ffd36b" opacity=".35" />
            ))}
          </g>
        ))}
        <rect x="0" y="236" width="400" height="64" fill="#26194f" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={110 - i * 6} y={246 + i * 11} width={44 + i * 14} height="3" fill="#ffd9a0" opacity={0.6 - i * 0.12} />
        ))}
      </>
    ),
  },
  curitiba: {
    ceu: ['#232a6e', '#6f5aa8', '#f4b57a'],
    sol: { x: 70, y: 124, r: 24, cor: '#ffe5b0' },
    corpo: (
      <>
        <path d="M0 222 Q100 196 200 216 T400 206 V300 H0Z" fill="#2a1d5e" />
        {/* estufa do Jardim Botânico */}
        <g>
          <path d="M120 262 V222 Q120 190 200 190 Q280 190 280 222 V262Z" fill="#150e30" opacity=".92" />
          <g stroke="#ffd9a0" strokeWidth="1.4" opacity=".55" fill="none">
            <path d="M120 222 H280 M160 262 V192 M200 262 V190 M240 262 V192" />
            <path d="M120 240 H280" />
          </g>
          <path d="M126 262 V224 Q126 196 200 196 Q274 196 274 224 V262Z" fill="#ffd36b" opacity=".16" />
        </g>
        <Araucaria x={60} y={266} h={86} c="#150e30" />
        <Araucaria x={340} y={266} h={74} c="#150e30" />
        <Araucaria x={36} y={270} h={52} c="#1d1440" />
        <rect x="0" y="262" width="400" height="38" fill="#0f0a24" />
      </>
    ),
  },
};

export function CidadeArte({ slug }: { slug: string }) {
  const cena = CENAS[slug] ?? CENAS.gramado;
  const [c0, c1, c2] = cena.ceu;
  const id = `ca-${slug}`;
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-ceu`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c0} />
          <stop offset=".55" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
        <radialGradient id={`${id}-sol`}>
          <stop offset="0" stopColor={cena.sol.cor} stopOpacity=".9" />
          <stop offset="1" stopColor={cena.sol.cor} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}-ceu)`} />
      <circle cx={cena.sol.x} cy={cena.sol.y} r={cena.sol.r * 3.2} fill={`url(#${id}-sol)`} />
      <circle cx={cena.sol.x} cy={cena.sol.y} r={cena.sol.r} fill={cena.sol.cor} />
      {cena.corpo}
    </svg>
  );
}

export const slugCidade = (nome: string) =>
  nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-');
