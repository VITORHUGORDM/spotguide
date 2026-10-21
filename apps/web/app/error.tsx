'use client';

// Falha momentânea (API fora do ar ou com muitos pedidos): a pessoa pode tentar de novo sem recarregar tudo.
export default function Erro({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="mb-3 text-3xl font-black tracking-tight">Algo deu errado por aqui</h1>
      <p className="mb-8 text-slate-400">Não conseguimos carregar esta página agora. Aguarde um instante e tente de novo.</p>
      <button onClick={reset} className="rounded-xl bg-[#f2a65a] px-6 py-3 font-bold text-[#0b0a17]">
        Tentar de novo
      </button>
    </div>
  );
}
