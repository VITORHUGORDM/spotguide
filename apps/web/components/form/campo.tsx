import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

/** Classes do input: borda vermelha quando há erro. */
export const entrada = (erro?: string) =>
  `w-full px-4 py-3 bg-white/[0.04] border rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition focus:ring-1 ${
    erro
      ? 'border-red-500/60 focus:border-red-500/80 focus:ring-red-500/30'
      : 'border-white/[0.1] focus:border-purple-500/60 focus:ring-purple-500/30'
  }`;

/** Atributos de acessibilidade que ligam o input à mensagem de erro. */
export const ligacao = (id: string, erro?: string) => ({
  id,
  'aria-invalid': erro ? (true as const) : undefined,
  'aria-describedby': erro ? `${id}-erro` : undefined,
});

interface CampoProps {
  id: string;
  rotulo: string;
  erro?: string;
  dica?: string;
  obrigatorio?: boolean;
  className?: string;
  children: ReactNode;
}

export function Campo({ id, rotulo, erro, dica, obrigatorio, className = '', children }: CampoProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-300 mb-1.5">
        {rotulo}
        {obrigatorio && <span className="text-[#f2a65a]"> *</span>}
      </label>
      {children}
      {erro ? (
        <p id={`${id}-erro`} role="alert" className="mt-1.5 flex items-start gap-1.5 text-[11px] text-red-400">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
          {erro}
        </p>
      ) : dica ? (
        <p className="mt-1.5 text-[11px] text-slate-500">{dica}</p>
      ) : null}
    </div>
  );
}
