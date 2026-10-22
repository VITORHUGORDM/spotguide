/**
 * A ilha do SpotGuide, desenhada em SVG: um pedaço de Brasil em miniatura
 * (café com toldo, farol, coqueiros, guarda-sol e um pin de mapa cravado no chão)
 * sobre terra vermelha com raízes e pedras penduradas.
 * Tudo determinístico (sem Math.random) para não dar diferença na hidratação.
 */

const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const f = (n: number) => Math.round(n * 10) / 10;

/** ponto dentro da elipse do chão (cx 723, cy 548, rx 650, ry 112) */
const chao = (u: number, v: number) => {
  const a = u * Math.PI * 2;
  const r = Math.sqrt(v);
  return [723 + Math.cos(a) * 640 * r, 548 + Math.sin(a) * 104 * r] as const;
};


/** Silhueta orgânica da barriga da ilha: envelope arredondado + ruído + estalactites */
function criaCorpo() {
  const r = rng(5);
  const N = 46;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= N; i++) {
    const x = 70 + (1310 * i) / N;
    const t = (x - 725) / 655;
    const env = Math.sqrt(Math.max(0, 1 - t * t));
    let y = 548 + 70 * env + 360 * Math.pow(env, 1.45) * (0.82 + r() * 0.3);
    if (i % 5 === 2) y += 36 + r() * 40; // estalactites
    pts.push([x, Math.max(y, 556)]);
  }
  let d = `M${pts[0][0]} 548 L${pts[0][0]} ${f(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    d += ` Q${f(x0)} ${f(y0)} ${f((x0 + x1) / 2)} ${f((y0 + y1) / 2)}`;
  }
  d += ` L${pts[N][0]} ${f(pts[N][1])} L${pts[N][0]} 548Z`;
  return { d, pts };
}

/** pedra irregular com faces: devolve o corpo e o topo iluminado */
function pedra(cx: number, cy: number, rr: number, seed: number) {
  const r = rng(seed);
  const n = 8;
  const v = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 0.7 + r() * 0.5;
    return [cx + Math.cos(a) * rr * k * 1.15, cy + Math.sin(a) * rr * k * 0.85] as const;
  });
  const corpo = 'M' + v.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L') + 'Z';
  const topo = 'M' + v.slice(4, 8).concat([v[0], v[1]]).map(([x, y]) => `${f(x)} ${f(y)}`).join(' L') + ' L' + `${f(cx)} ${f(cy)}Z`;
  return { corpo, topo };
}

/** raiz com galhos */
function raiz(x: number, y: number, len: number, seed: number) {
  const r = rng(seed);
  const sway = (r() - 0.5) * 90;
  const x1 = x + sway * 0.4;
  const x2 = x + sway;
  const main = `M${f(x)} ${f(y)} C${f(x1)} ${f(y + len * 0.35)} ${f(x2 - sway * 0.3)} ${f(y + len * 0.65)} ${f(x2)} ${f(y + len)}`;
  const b1 = `M${f(x1)} ${f(y + len * 0.35)} q${f((r() - 0.3) * 50)} ${f(len * 0.2)} ${f((r() - 0.3) * 60)} ${f(len * 0.4)}`;
  const b2 = `M${f(x2 - sway * 0.3)} ${f(y + len * 0.65)} q${f((r() - 0.7) * 50)} ${f(len * 0.12)} ${f((r() - 0.7) * 50)} ${f(len * 0.3)}`;
  return { main, b1, b2, w: 2.6 + r() * 2.4 };
}

function Palmeira({ x, y, h, inclina, s = 1 }: { x: number; y: number; h: number; inclina: number; s?: number }) {
  const topoX = x + inclina;
  const topoY = y - h;
  const folhas = [-168, -140, -112, -84, -56, -28, -4, 150];
  const tons = ['#2f7d3a', '#3f9a45', '#2a6e34', '#4aa84c'];
  return (
    <g>
      <path
        d={`M${x - 9 * s} ${y} Q${x + inclina * 0.1} ${y - h * 0.55} ${topoX - 5 * s} ${topoY} L${topoX + 5 * s} ${topoY} Q${x + inclina * 0.1 + 14 * s} ${y - h * 0.55} ${x + 9 * s} ${y}Z`}
        fill="#8d5b34"
      />
      <path
        d={`M${x + 1} ${y} Q${x + inclina * 0.1 + 6} ${y - h * 0.55} ${topoX + 2} ${topoY}`}
        stroke="#6f4525"
        strokeWidth={3 * s}
        fill="none"
        opacity=".55"
      />
      {Array.from({ length: 9 }, (_, i) => {
        const t = (i + 1) / 10;
        const cx = x + inclina * (2 * t * (1 - t) * 0.1 + t * t) + 2;
        const cy = y - h * t;
        return <path key={i} d={`M${cx - 8 * s} ${cy} q${8 * s} ${4 * s} ${16 * s} 0`} stroke="#5d3a1e" strokeWidth={2} fill="none" opacity=".5" />;
      })}
      <g transform={`translate(${topoX} ${topoY}) scale(${s})`}>
        {folhas.map((ang, i) => (
          <path
            key={i}
            transform={`rotate(${ang})`}
            d="M0 0 C34 -30 108 -30 158 26 C108 -2 44 8 0 0Z"
            fill={tons[i % tons.length]}
          />
        ))}
        <circle cx="-8" cy="8" r="8" fill="#6b4a22" />
        <circle cx="9" cy="10" r="8" fill="#7d5628" />
        <circle cx="0" cy="14" r="7.5" fill="#6b4a22" />
      </g>
    </g>
  );
}

function GuardaSol({ x, y }: { x: number; y: number }) {
  const listras = Array.from({ length: 8 }, (_, i) => i);
  return (
    <g>
      <ellipse cx={x + 6} cy={y + 8} rx="84" ry="12" fill="#2b1a10" opacity=".28" />
      <rect x={x - 62} y={y - 2} width="96" height="16" rx="3" fill="#f2a65a" transform={`rotate(-8 ${x} ${y})`} />
      <rect x={x - 62} y={y + 4} width="96" height="5" fill="#faf6ee" transform={`rotate(-8 ${x} ${y})`} opacity=".8" />
      <rect x={x + 2} y={y - 120} width="5" height="130" fill="#e9dcc3" />
      <g transform={`translate(${x + 4} ${y - 118})`}>
        {listras.map((i) => {
          const a0 = Math.PI + (i * Math.PI) / 8;
          const a1 = Math.PI + ((i + 1) * Math.PI) / 8;
          return (
            <path
              key={i}
              d={`M0 0 L${f(Math.cos(a0) * 92)} ${f(Math.sin(a0) * 44)} Q${f(Math.cos((a0 + a1) / 2) * 98)} ${f(Math.sin((a0 + a1) / 2) * 56)} ${f(Math.cos(a1) * 92)} ${f(Math.sin(a1) * 44)}Z`}
              fill={i % 2 ? '#faf6ee' : '#d9484a'}
            />
          );
        })}
        <path d="M-92 0 Q0 24 92 0" stroke="#7d2a2e" strokeWidth="2" fill="none" opacity=".5" />
      </g>
    </g>
  );
}

function Mesa({ x, y, cor }: { x: number; y: number; cor: string }) {
  return (
    <g>
      <ellipse cx={x} cy={y + 6} rx="46" ry="8" fill="#2b1a10" opacity=".25" />
      <rect x={x - 3} y={y - 58} width="6" height="62" fill="#e9dcc3" />
      <path d={`M${x - 64} ${y - 52} Q${x} ${y - 100} ${x + 64} ${y - 52} Q${x} ${y - 64} ${x - 64} ${y - 52}Z`} fill={cor} />
      <path d={`M${x - 64} ${y - 52} Q${x} ${y - 64} ${x + 64} ${y - 52}`} stroke="#00000030" strokeWidth="2" fill="none" />
      <ellipse cx={x} cy={y - 22} rx="30" ry="6" fill="#faf6ee" />
      <rect x={x - 2} y={y - 22} width="4" height="24" fill="#d8caa8" />
      <circle cx={x - 12} cy={y - 29} r="4" fill="#d9697a" />
      <rect x={x + 6} y={y - 36} width="7" height="9" rx="2" fill="#f2a65a" />
    </g>
  );
}

export function IlhaSvg() {
  const r = rng(11);
  const corpo = criaCorpo();
  const pedras = [
    pedra(330, 790, 54, 1),
    pedra(1010, 800, 64, 2),
    pedra(640, 880, 46, 3),
    pedra(1200, 720, 40, 4),
    pedra(190, 660, 30, 5),
  ];
  const pendentes = [pedra(620, 975, 36, 6), pedra(850, 960, 30, 7), pedra(470, 930, 22, 8)];
  const franja = Array.from({ length: 64 }, (_, i) => {
    const a = (i / 63) * Math.PI;
    return { x: f(723 + Math.cos(a) * 650), y: f(548 + Math.sin(a) * 111 + 6), r: 9 + r() * 9, c: ['#3f8a41', '#4f9a3a', '#2f6b34'][i % 3] };
  });

  // flores espalhadas pelo chão
  const flores = Array.from({ length: 54 }, () => {
    const [x, y] = chao(r(), r());
    return { x: f(x), y: f(y), c: ['#d9697a', '#f2a65a', '#faf6ee', '#ffd36b', '#e07ab8'][Math.floor(r() * 5)], s: 2 + r() * 2.4 };
  });
  const tufos = Array.from({ length: 70 }, () => {
    const [x, y] = chao(r(), r());
    return { x: f(x), y: f(y), h: 9 + r() * 12 };
  });

  // raízes penduradas pela barriga da ilha (nascem na silhueta)
  const raizes = corpo.pts
    .filter((_, i) => i % 2 === 1 && i > 2 && i < 44)
    .map(([x, y], i) => raiz(x + (i % 3) * 6, y - 18, 90 + ((i * 53) % 140), 30 + i));

  const lampadas = Array.from({ length: 13 }, (_, i) => {
    const t = i / 12;
    const x = 478 + t * 392;
    const y = 428 + Math.sin(t * Math.PI) * 44;
    return { x: f(x), y: f(y), c: ['#ffd36b', '#ff9d6b', '#fff0c2'][i % 3] };
  });

  const markers = [
    [236, 468],
    [1040, 500],
    [1240, 470],
  ];

  return (
    <>
    {/* As partes que se mexem ficam em SVGs próprios: dentro do principal, qualquer quadro repintaria a ilha toda
        (turbulência, desfoque e mistura). Os ids de gradiente e clip vêm do SVG principal. */}
    <svg className="ilha-svg ilha-anim ilha-cachoeira" viewBox="0 150 1446 850" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <path d="M168 668 q-6 120 2 326" stroke="url(#il-cachoeira)" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d="M178 672 q-4 100 0 280" stroke="url(#il-cachoeira)" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
    <svg
      className="ilha-svg"
      viewBox="0 150 1446 850"
      role="img"
      aria-label="Ilha flutuante com um café de toldo listrado, um farol, coqueiros, um guarda-sol e um pin de mapa gigante cravado na grama"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="il-terra" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c8582e" />
          <stop offset=".35" stopColor="#a8431f" />
          <stop offset=".7" stopColor="#7d2f17" />
          <stop offset="1" stopColor="#4d1c0f" />
        </linearGradient>
        <linearGradient id="il-sombra-lado" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1b1647" stopOpacity=".5" />
          <stop offset=".45" stopColor="#1b1647" stopOpacity="0" />
          <stop offset="1" stopColor="#ffb866" stopOpacity=".22" />
        </linearGradient>
        <linearGradient id="il-sombra-baixo" x1="0" y1="0" x2="0" y2="1">
          <stop offset=".35" stopColor="#12082a" stopOpacity="0" />
          <stop offset="1" stopColor="#12082a" stopOpacity=".55" />
        </linearGradient>
        <radialGradient id="il-grama" cx=".5" cy=".42" r=".7">
          <stop offset="0" stopColor="#a9b84a" />
          <stop offset=".55" stopColor="#6f9a3a" />
          <stop offset="1" stopColor="#4f7d33" />
        </radialGradient>
        <radialGradient id="il-pin-brilho" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#ff9d6b" stopOpacity=".85" />
          <stop offset="1" stopColor="#ff9d6b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="il-janela" cx=".5" cy=".5" r=".6">
          <stop offset="0" stopColor="#fff0b8" />
          <stop offset="1" stopColor="#ffb64d" />
        </radialGradient>
        <linearGradient id="il-pin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff8d6b" />
          <stop offset="1" stopColor="#c9405a" />
        </linearGradient>
        <linearGradient id="il-feixe" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff2b8" stopOpacity=".7" />
          <stop offset="1" stopColor="#fff2b8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="il-cachoeira" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8f4ff" stopOpacity=".9" />
          <stop offset="1" stopColor="#e8f4ff" stopOpacity="0" />
        </linearGradient>
        <filter id="il-rugoso" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency=".018 .026" numOctaves="3" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="26" />
        </filter>
        <filter id="il-borra" x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <clipPath id="il-corpo">
          <path d={corpo.d} />
        </clipPath>
        <clipPath id="il-silhueta">
          <path d={corpo.d} />
        </clipPath>
      </defs>

      {/* raízes penduradas */}
      <g stroke="#6b4527" fill="none" strokeLinecap="round">
        {raizes.map((rz, i) => (
          <g key={i}>
            <path d={rz.main} strokeWidth={rz.w} />
            <path d={rz.b1} strokeWidth={rz.w * 0.55} />
            <path d={rz.b2} strokeWidth={rz.w * 0.45} />
          </g>
        ))}
      </g>

      {/* corpo de terra */}
      <g filter="url(#il-rugoso)">
        <path
          d={corpo.d}
          fill="url(#il-terra)"
        />
      </g>
      <g clipPath="url(#il-corpo)">
        {/* camadas de solo */}
        <path d="M60 690 Q300 740 560 700 T1000 720 T1390 690 V760 Q1100 800 800 770 T60 770Z" fill="#8b3519" opacity=".35" />
        <path d="M200 800 Q480 850 760 820 T1260 790 V860 Q1000 900 760 880 T200 870Z" fill="#4d1c0f" opacity=".3" />
        {/* pedras */}
        {pedras.map((pd, i) => (
          <g key={i}>
            <path d={pd.corpo} fill="#9a9288" />
            <path d={pd.topo} fill="#cdc6bb" opacity=".85" />
            <path d={pd.corpo} fill="none" stroke="#5c564e" strokeWidth="2" opacity=".5" />
          </g>
        ))}
        {/* sombras e luz */}
        <rect x="60" y="540" width="1330" height="460" fill="url(#il-sombra-baixo)" />
        <rect x="60" y="540" width="1330" height="460" fill="url(#il-sombra-lado)" />
      </g>

      {/* pedras e torrões pendurados */}
      <g>
        {pendentes.map((pd, i) => (
          <g key={i}>
            <path d={pd.corpo} fill="#8f877d" />
            <path d={pd.topo} fill="#c4bdb2" opacity=".85" />
          </g>
        ))}
        <circle cx="332" cy="930" r="15" fill="#8b3519" />
        <circle cx="1086" cy="950" r="12" fill="#8b3519" />
        <circle cx="468" cy="990" r="8" fill="#a8431f" />
        <circle cx="1190" cy="900" r="9" fill="#8b3519" />
      </g>

      {/* barra de terra do chão (espessura) e o chão */}
      <ellipse cx="723" cy="563" rx="654" ry="114" fill="#b5512a" />
      <ellipse cx="723" cy="557" rx="654" ry="113" fill="#8b3519" opacity=".35" />
      <ellipse cx="723" cy="548" rx="652" ry="112" fill="url(#il-grama)" />
      <g>
        {franja.map((g, i) => (
          <circle key={i} cx={g.x} cy={g.y} r={g.r} fill={g.c} />
        ))}
      </g>
      <ellipse cx="723" cy="548" rx="652" ry="112" fill="url(#il-grama)" />
      <ellipse cx="723" cy="548" rx="652" ry="112" fill="none" stroke="#a8cf5e" strokeWidth="3" opacity=".55" />

      {/* trilha de areia até o café */}
      <path
        d="M690 660 C640 640 604 612 628 578 C640 560 650 548 662 530 L700 530 C712 556 740 580 800 600 C860 622 900 640 884 662 C840 680 760 676 690 660Z"
        fill="#e9c98f"
        opacity=".9"
      />
      <path d="M700 530 C712 556 740 580 800 600" stroke="#c9a468" strokeWidth="2" fill="none" opacity=".6" />

      {/* tufos e flores */}
      <g stroke="#3f6b2a" strokeWidth="2" strokeLinecap="round" fill="none">
        {tufos.map((t, i) => (
          <path key={i} d={`M${t.x - 3} ${t.y} l-3 ${-t.h * 0.7} M${t.x} ${t.y} l0 ${-t.h} M${t.x + 3} ${t.y} l3 ${-t.h * 0.7}`} />
        ))}
      </g>
      <g>
        {flores.map((fl, i) => (
          <circle key={i} cx={fl.x} cy={fl.y} r={fl.s} fill={fl.c} />
        ))}
      </g>

      {/* postes de luz */}
      {markers.map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 2} y={y - 60} width="4" height="62" fill="#3a2a2a" />
          <circle cx={x} cy={y - 64} r="8" fill="#ffe08a" />
          <circle cx={x} cy={y - 64} r="22" fill="url(#il-janela)" opacity=".35" />
        </g>
      ))}

      {/* farol (atrás) */}
      <g>
        <ellipse cx="1150" cy="524" rx="56" ry="9" fill="#2b1a10" opacity=".3" />
        <path d="M1110 522 L1190 522 L1172 280 L1128 280Z" fill="#faf6ee" />
        <path d="M1118 462 L1182 462 L1178 424 L1122 424Z M1131 368 L1169 368 L1166 334 L1134 334Z" fill="#d9483b" />
        <path d="M1110 522 L1190 522 L1172 280 L1128 280Z" fill="url(#il-sombra-lado)" opacity=".7" />
        <path d="M1118 462 L1182 462" stroke="#8c2a22" strokeWidth="1.5" opacity=".4" />
        <rect x="1112" y="268" width="76" height="14" rx="3" fill="#3a3347" />
        <rect x="1128" y="228" width="44" height="42" rx="4" fill="url(#il-janela)" />
        <path d="M1128 228 h44 M1150 228 v42" stroke="#3a3347" strokeWidth="3" />
        <path d="M1120 230 L1150 196 L1180 230Z" fill="#d9483b" />
        <circle cx="1150" cy="192" r="5" fill="#3a3347" />
        <rect x="1138" y="480" width="24" height="42" rx="12" fill="#2a3b66" />
        <rect x="1140" y="396" width="20" height="14" rx="3" fill="#2a3b66" />
      </g>

      {/* palmeiras do fundo */}
      <Palmeira x={1310} y={546} h={170} inclina={26} s={0.8} />
      <Palmeira x={206} y={530} h={250} inclina={-36} />

      {/* café */}
      <g>
        <ellipse cx="676" cy="535" rx="190" ry="14" fill="#2b1a10" opacity=".3" />
        <rect x="548" y="396" width="256" height="136" fill="#f4e7d0" />
        <rect x="548" y="396" width="256" height="136" fill="url(#il-sombra-lado)" opacity=".8" />
        <path d="M548 520 h256" stroke="#d8c6a0" strokeWidth="6" />
        {/* telhado */}
        <path d="M522 402 L676 322 L830 402Z" fill="#c4522b" />
        <path d="M522 402 L676 322 L830 402Z" fill="url(#il-sombra-lado)" opacity=".7" />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${548 + i * 14} ${392 - i * 8} L${804 - i * 14} ${392 - i * 8}`} stroke="#8d3418" strokeWidth="2" opacity=".5" />
        ))}
        <rect x="730" y="326" width="26" height="46" fill="#a63d1f" />
        <rect x="726" y="320" width="34" height="9" fill="#8d3418" />
        {/* placa */}
        <rect x="618" y="404" width="116" height="30" rx="6" fill="#2a3b66" />
        <text x="676" y="426" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontWeight="700" fontSize="19" fill="#ffd36b" letterSpacing="3">
          CAFÉ
        </text>
        {/* toldo listrado */}
        <g>
          {Array.from({ length: 12 }, (_, i) => (
            <path
              key={i}
              d={`M${548 + i * 21.3} 440 h21.3 v22 q-10.6 12 -21.3 0Z`}
              fill={i % 2 ? '#faf6ee' : '#e0574f'}
            />
          ))}
          <path d="M538 440 L814 440 L804 436 L548 436Z" fill="#c8453e" />
          <rect x="548" y="436" width="256" height="6" fill="#c8453e" />
        </g>
        {/* janelas e porta */}
        <rect x="570" y="478" width="52" height="44" rx="3" fill="url(#il-janela)" />
        <path d="M596 478 v44 M570 500 h52" stroke="#6b4a2a" strokeWidth="3" />
        <rect x="730" y="478" width="52" height="44" rx="3" fill="url(#il-janela)" />
        <path d="M756 478 v44 M730 500 h52" stroke="#6b4a2a" strokeWidth="3" />
        <path d="M652 524 v-48 q24 -22 48 0 v48Z" fill="#2a3b66" />
        <path d="M664 524 v-42 q12 -12 24 0 v42Z" fill="url(#il-janela)" opacity=".85" />
        <circle cx="694" cy="502" r="2.5" fill="#ffd36b" />
        {/* luzinhas */}
        <path d="M478 428 Q670 520 870 428" stroke="#3a2a2a" strokeWidth="1.8" fill="none" />
        {lampadas.map((l, i) => (
          <g key={i}>
            <circle cx={l.x} cy={l.y} r="12" fill={l.c} opacity=".28" />
            <circle cx={l.x} cy={l.y} r="4.5" fill={l.c} />
          </g>
        ))}
      </g>

      {/* mesas na frente do café */}
      <Mesa x={598} y={612} cor="#e0574f" />
      <Mesa x={800} y={624} cor="#2a8fa8" />

      {/* guarda-sol e toalha */}
      <GuardaSol x={402} y={602} />

      {/* palmeira da frente */}
      <Palmeira x={302} y={588} h={196} inclina={30} s={0.92} />

      {/* placa de direções */}
      <g>
        <rect x="1008" y="560" width="6" height="86" fill="#7a4c28" />
        <path d="M1014 566 h54 l12 10 l-12 10 h-54z" fill="#faf6ee" />
        <path d="M1008 592 h-48 l-12 10 l12 10 h48z" fill="#f2a65a" />
        <path d="M1014 618 h44 l10 9 l-10 9 h-44z" fill="#6fb3c9" />
        <circle cx="1068" cy="576" r="3" fill="#e0574f" />
      </g>

      {/* pin de mapa gigante cravado na grama */}
      <g>
        <ellipse cx="1134" cy="640" rx="84" ry="16" fill="url(#il-pin-brilho)" />
        <ellipse cx="1134" cy="642" rx="30" ry="7" fill="#2b1a10" opacity=".45" />
      </g>

      {/* arbustos de primeiro plano */}
      <g>
        <g transform="translate(150 610)">
          <circle r="28" fill="#2f6b34" />
          <circle cx="24" cy="6" r="22" fill="#3f8a41" />
          <circle cx="-22" cy="8" r="20" fill="#357a3a" />
          <circle cx="-6" cy="-10" r="3" fill="#d9697a" />
          <circle cx="14" cy="-2" r="3" fill="#ffd36b" />
          <circle cx="-26" cy="4" r="3" fill="#faf6ee" />
        </g>
        <g transform="translate(1290 620)">
          <circle r="26" fill="#2f6b34" />
          <circle cx="-22" cy="6" r="21" fill="#3f8a41" />
          <circle cx="20" cy="8" r="19" fill="#357a3a" />
          <circle cx="4" cy="-8" r="3" fill="#e07ab8" />
          <circle cx="-14" cy="0" r="3" fill="#ffd36b" />
        </g>
        <g transform="translate(540 650)">
          <circle r="22" fill="#357a3a" />
          <circle cx="20" cy="4" r="18" fill="#3f8a41" />
          <circle cx="2" cy="-8" r="3" fill="#f2a65a" />
        </g>
      </g>

      {/* luz do pôr do sol sobre toda a ilha */}
      <g clipPath="url(#il-silhueta)" style={{ mixBlendMode: 'soft-light' }}>
        <rect x="0" y="0" width="1446" height="994" fill="url(#il-sombra-lado)" />
      </g>
    </svg>
    <svg className="ilha-svg ilha-anim ilha-feixe" viewBox="0 150 1446 850" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#il-corpo)">
        <g filter="url(#il-borra)">
          <path d="M1150 249 L760 214 L760 292Z" fill="url(#il-feixe)" />
          <path d="M1150 249 L1380 232 L1380 280Z" fill="url(#il-feixe)" opacity=".45" />
        </g>
      </g>
    </svg>
    <svg className="ilha-svg ilha-anim ilha-pin" viewBox="0 150 1446 850" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(1134 642) scale(5.6) translate(-12 -32)">
            <path
              d="M12 0C5.4 0 0 5.3 0 11.8 0 20.5 12 32 12 32s12-11.5 12-20.2C24 5.3 18.6 0 12 0Z"
              fill="url(#il-pin)"
            />
            <path d="M12 0C5.4 0 0 5.3 0 11.8 0 20.5 12 32 12 32s12-11.5 12-20.2C24 5.3 18.6 0 12 0Z" fill="url(#il-sombra-lado)" opacity=".8" />
            <circle cx="12" cy="11.6" r="4.9" fill="#faf6ee" />
            <path d="M5 6 Q8 2.5 12 2.2" stroke="#fff" strokeWidth="1.2" fill="none" opacity=".6" strokeLinecap="round" />
          </g>
    </svg>
    </>
  );
}
