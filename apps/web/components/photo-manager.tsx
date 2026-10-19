'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Star, Trash2, Loader2 } from 'lucide-react';
import { ApiClient } from '../lib/api-client';

export interface FotoLocal {
  id: string;
  url: string;
  caption: string | null;
  isCover: boolean;
}

const TIPOS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_FOTOS = 8;

/** Envio, capa e remoção das fotos de um estabelecimento (painel do comerciante). */
export function PhotoManager({
  placeId,
  token,
  fotosIniciais,
}: {
  placeId: string;
  token: string;
  fotosIniciais: FotoLocal[];
}) {
  const [fotos, setFotos] = useState<FotoLocal[]>(fotosIniciais);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const enviar = async (arquivos: FileList | null) => {
    if (!arquivos?.length) return;
    setErro(null);

    const lista = Array.from(arquivos);
    if (fotos.length + lista.length > MAX_FOTOS) {
      setErro(`Cada local aceita até ${MAX_FOTOS} fotos.`);
      return;
    }
    const invalida = lista.find((f) => !TIPOS.includes(f.type) || f.size > MAX_BYTES);
    if (invalida) {
      setErro(`"${invalida.name}" não serve: use JPG, PNG ou WebP de até 5 MB.`);
      return;
    }

    setEnviando(true);
    try {
      for (const arquivo of lista) {
        const nova = await ApiClient.uploadPhoto(placeId, arquivo, token);
        setFotos((atual) => [...atual, nova]);
      }
    } catch (e: any) {
      setErro(e.message || 'Não foi possível enviar a foto.');
    } finally {
      setEnviando(false);
      if (input.current) input.current.value = '';
    }
  };

  const remover = async (id: string) => {
    if (!window.confirm('Remover esta foto?')) return;
    setErro(null);
    try {
      await ApiClient.deletePhoto(placeId, id, token);
      setFotos((atual) => {
        const resto = atual.filter((f) => f.id !== id);
        // se a capa saiu, a primeira que sobrou assume (igual ao servidor)
        if (resto.length && !resto.some((f) => f.isCover)) resto[0] = { ...resto[0], isCover: true };
        return resto;
      });
    } catch (e: any) {
      setErro(e.message || 'Não foi possível remover a foto.');
    }
  };

  const tornarCapa = async (id: string) => {
    setErro(null);
    try {
      await ApiClient.setCoverPhoto(placeId, id, token);
      setFotos((atual) => atual.map((f) => ({ ...f, isCover: f.id === id })));
    } catch (e: any) {
      setErro(e.message || 'Não foi possível trocar a capa.');
    }
  };

  return (
    <section className="rounded-3xl border border-white/[0.1] bg-white/[0.03] p-6 sm:p-8 space-y-5" aria-labelledby="titulo-fotos">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 id="titulo-fotos" className="hero-titulo text-2xl tracking-[-0.03em]">
            Fotos do local
          </h2>
          <p className="text-xs text-slate-400">
            JPG, PNG ou WebP de até 5 MB, no máximo {MAX_FOTOS}. A primeira foto vira a capa; você pode trocar depois.
          </p>
        </div>
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={enviando || fotos.length >= MAX_FOTOS}
          className="botao-pilula disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{enviando ? 'Enviando...' : 'Adicionar fotos'}</span>
          <span className="botao-pilula__circulo" aria-hidden="true">
            {enviando ? <Loader2 className="animate-spin" /> : <ImagePlus />}
          </span>
        </button>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          aria-label="Escolher fotos"
          onChange={(e) => enviar(e.target.files)}
        />
      </div>

      {erro && (
        <p role="alert" className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3">
          {erro}
        </p>
      )}

      {fotos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.15] p-10 text-center text-sm text-slate-400">
          Nenhuma foto ainda. Locais com foto recebem muito mais cliques.
        </div>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {fotos.map((f) => (
            <li key={f.id} className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/[0.12] bg-black/30">
              <img src={f.url} alt={f.caption || 'Foto do local'} className="w-full h-full object-cover" />
              {f.isCover && (
                <span className="absolute top-2 left-2 hero-mono text-[10px] bg-[#faf6ee] text-[#0b0a17] px-2.5 py-1 rounded-full">
                  capa
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-2 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition">
                {!f.isCover ? (
                  <button
                    type="button"
                    onClick={() => tornarCapa(f.id)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#faf6ee] bg-white/15 hover:bg-white/25 backdrop-blur px-2.5 py-1.5 rounded-full"
                  >
                    <Star className="w-3 h-3" /> Tornar capa
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => remover(f.id)}
                  aria-label="Remover foto"
                  className="text-red-200 bg-red-500/25 hover:bg-red-500/45 backdrop-blur p-1.5 rounded-full"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
