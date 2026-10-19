/** Faixa de nuvem suave entre seções: o céu continua mesmo depois que a ilha sai. */
export function DivisorNuvem({ src, espelha }: { src: string; espelha?: boolean }) {
  return (
    <div className={`divisor-nuvem${espelha ? ' divisor-nuvem--espelha' : ''}`} aria-hidden="true">
      <img src={`/img/${src}.webp`} alt="" />
    </div>
  );
}
