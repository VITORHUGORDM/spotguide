'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { PlaceListItem, CategoryResponse } from '@guia/contracts';
import { estadoPorUf } from '@guia/contracts/brasil';
import { rotuloComodidade, simboloPreco } from '@guia/contracts/comodidades';
import { ApiClient } from '../../lib/api-client';
import {
  contaFiltros,
  filtrosDaUrl,
  filtrosParaApi,
  filtrosParaUrl,
  type Filtros,
  type Perto,
} from '../../lib/filtros-locais';
import { PainelFiltros } from '../../components/locais/painel-filtros';
import { PlaceCard } from '../../components/locais/place-card';
import { List, Map as MapIcon, RotateCcw, X } from 'lucide-react';

const MapaLocais = dynamic(() => import('../../components/mapa-locais'), {
  ssr: false,
  loading: () => <div className="mapa-locais animate-pulse" />,
});

const POR_PAGINA = 24;

function LocaisContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlTexto = searchParams.toString();
  const filtros = useMemo(() => filtrosDaUrl(new URLSearchParams(urlTexto)), [urlTexto]);

  const [places, setPlaces] = useState<PlaceListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [estados, setEstados] = useState<Map<string, number>>(new Map());
  const [view, setView] = useState<'lista' | 'mapa'>('lista');
  const [perto, setPerto] = useState<Perto | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'buscando' | 'negado'>('idle');

  // texto digitado que ainda não virou filtro
  const [busca, setBusca] = useState(filtros.busca);
  const [cidadeTexto, setCidadeTexto] = useState(filtros.cidade);
  const ultimaBusca = useRef(filtros.busca);

  useEffect(() => {
    ApiClient.getCategories().then(setCategories).catch(() => {});
    ApiClient.getStates().then((lista) => setEstados(new Map(lista.map((e) => [e.uf, e.count]))));
  }, []);

  const aplicar = useCallback(
    (patch: Partial<Filtros>) => {
      const proximo = { ...filtros, ...patch };
      if ('busca' in patch) ultimaBusca.current = proximo.busca;
      const qs = filtrosParaUrl(proximo);
      router.replace(qs ? `/locais?${qs}` : '/locais', { scroll: false });
    },
    [filtros, router]
  );

  // a busca por texto espera uma pausa na digitação; os outros filtros valem na hora
  useEffect(() => {
    if (busca.trim() === filtros.busca.trim()) return;
    const t = setTimeout(() => aplicar({ busca }), 400);
    return () => clearTimeout(t);
  }, [busca, filtros.busca, aplicar]);

  // a URL mudou por fora (limpar filtros, botão voltar): o campo acompanha
  useEffect(() => {
    if (filtros.busca !== ultimaBusca.current) {
      ultimaBusca.current = filtros.busca;
      setBusca(filtros.busca);
    }
  }, [filtros.busca]);
  useEffect(() => setCidadeTexto(filtros.cidade), [filtros.cidade]);

  // Uma busca por vez: se os filtros mudam no meio do caminho, a resposta antiga é descartada.
  const parametros = useMemo(() => filtrosParaApi(filtros, perto), [filtros, perto]);
  const chave = JSON.stringify(parametros);
  const chaveAtual = useRef(chave);
  chaveAtual.current = chave;

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setErro(false);
    ApiClient.searchPlacesPage({ ...parametros, limit: POR_PAGINA }, { signal: ctrl.signal })
      .then(({ items, total }) => {
        setPlaces(items);
        setTotal(total);
        setLoading(false);
      })
      .catch(() => {
        if (ctrl.signal.aborted) return;
        setPlaces([]);
        setTotal(0);
        setErro(true);
        setLoading(false);
      });
    return () => ctrl.abort();
    // `chave` resume `parametros`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, tentativa]);

  const carregarMais = async () => {
    const minhaChave = chave;
    setCarregandoMais(true);
    try {
      const { items } = await ApiClient.searchPlacesPage({
        ...parametros,
        limit: POR_PAGINA,
        page: Math.floor(places.length / POR_PAGINA) + 1,
      });
      if (chaveAtual.current === minhaChave) setPlaces((atual) => [...atual, ...items]);
    } catch {
      setErro(true);
    } finally {
      setCarregandoMais(false);
    }
  };

  const alternarPerto = () => {
    if (perto) {
      setPerto(null);
      if (filtros.ordem === 'distance') aplicar({ ordem: '' });
      return;
    }
    if (!navigator.geolocation) {
      setGeoStatus('negado');
      return;
    }
    setGeoStatus('buscando');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPerto({ lat: pos.coords.latitude, lng: pos.coords.longitude, raioKm: 25 });
        setGeoStatus('idle');
      },
      () => setGeoStatus('negado'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300_000 }
    );
  };

  const enviar = () => aplicar({ busca, cidade: cidadeTexto.trim() });

  const limpar = () => {
    setPerto(null);
    setBusca('');
    setCidadeTexto('');
    ultimaBusca.current = '';
    router.replace('/locais', { scroll: false });
  };

  const quantosFiltros = contaFiltros(filtros, Boolean(perto));
  const nomeCategoria = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

  // o que está filtrado agora, cada item com o jeito de tirar
  const ativos: Array<{ rotulo: string; tirar: () => void }> = [
    ...(filtros.busca.trim() ? [{ rotulo: `“${filtros.busca.trim()}”`, tirar: () => aplicar({ busca: '' }) }] : []),
    ...(filtros.estado
      ? [{ rotulo: estadoPorUf(filtros.estado)?.nome ?? filtros.estado, tirar: () => aplicar({ estado: '', cidade: '' }) }]
      : []),
    ...(filtros.cidade ? [{ rotulo: filtros.cidade, tirar: () => aplicar({ cidade: '' }) }] : []),
    ...filtros.categorias.map((slug) => ({
      rotulo: nomeCategoria(slug),
      tirar: () => aplicar({ categorias: filtros.categorias.filter((c) => c !== slug) }),
    })),
    ...(filtros.avaliacao ? [{ rotulo: `Nota ${String(filtros.avaliacao).replace('.', ',')}+`, tirar: () => aplicar({ avaliacao: undefined }) }] : []),
    ...(filtros.aberto ? [{ rotulo: 'Aberto agora', tirar: () => aplicar({ aberto: false }) }] : []),
    ...(filtros.comFoto ? [{ rotulo: 'Com fotos', tirar: () => aplicar({ comFoto: false }) }] : []),
    ...(filtros.preco ? [{ rotulo: `Até ${simboloPreco(filtros.preco)}`, tirar: () => aplicar({ preco: undefined }) }] : []),
    ...filtros.comodidades.map((id) => ({
      rotulo: rotuloComodidade(id),
      tirar: () => aplicar({ comodidades: filtros.comodidades.filter((c) => c !== id) }),
    })),
    ...(filtros.verificado ? [{ rotulo: 'Verificados', tirar: () => aplicar({ verificado: false }) }] : []),
    ...(perto ? [{ rotulo: `Até ${perto.raioKm} km de mim`, tirar: alternarPerto }] : []),
  ];

  const primeiraCarga = loading && places.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 bg-[#0b0a17] text-slate-100 min-h-screen">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Link href="/" className="hover:text-purple-400 transition">
            Início
          </Link>
          <span>/</span>
          <span className="text-white font-semibold">Explorar Estabelecimentos</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Onde você quer ir hoje?</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Qualquer estado e cidade do Brasil. Combine categoria, nota, horário e distância.{' '}
              <Link href="/estados" className="text-[#f2a65a] hover:underline">
                Ver por estado
              </Link>
            </p>
          </div>
          {quantosFiltros > 0 && (
            <button
              onClick={limpar}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.05] hover:bg-red-500/20 border border-white/[0.1] hover:border-red-500/30 rounded-xl transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-400" />
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      <PainelFiltros
        filtros={filtros}
        busca={busca}
        cidadeTexto={cidadeTexto}
        categorias={categories}
        contagemPorEstado={estados}
        perto={perto}
        geoStatus={geoStatus}
        quantosFiltros={quantosFiltros}
        onBusca={setBusca}
        onCidadeTexto={setCidadeTexto}
        onAplicar={aplicar}
        onEnviar={enviar}
        onPerto={alternarPerto}
        onRaio={(raioKm) => setPerto((p) => (p ? { ...p, raioKm } : p))}
      />

      {ativos.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Filtros ativos">
          {ativos.map((a) => (
            <li key={a.rotulo}>
              <button
                type="button"
                onClick={a.tirar}
                className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-200 hover:bg-red-500/20 hover:border-red-500/40 hover:text-white transition"
                title="Tirar este filtro"
              >
                {a.rotulo}
                <X className="w-3 h-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-white" aria-live="polite">
          {primeiraCarga ? 'Buscando estabelecimentos...' : `${total} ${total === 1 ? 'local encontrado' : 'locais encontrados'}`}
        </h2>
        <div className="inline-flex p-1 rounded-full bg-white/[0.06] border border-white/[0.1]" role="group" aria-label="Modo de visualização">
          {(['lista', 'mapa'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                view === v ? 'bg-[#faf6ee] text-[#0b0a17]' : 'text-slate-300 hover:text-white'
              }`}
            >
              {v === 'lista' ? <List className="w-3.5 h-3.5" /> : <MapIcon className="w-3.5 h-3.5" />}
              {v === 'lista' ? 'Lista' : 'Mapa'}
            </button>
          ))}
        </div>
      </div>

      {geoStatus === 'negado' && (
        <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3">
          Não consegui acessar sua localização. Libere a permissão do navegador ou escolha uma cidade.
        </p>
      )}

      {primeiraCarga ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-[#0a0a14] rounded-3xl border border-white/[0.06] p-4 animate-pulse space-y-4">
              <div className="h-56 bg-white/[0.04] rounded-2xl" />
              <div className="h-4 bg-white/[0.04] rounded w-3/4" />
              <div className="h-3 bg-white/[0.04] rounded w-1/2" />
              <div className="h-9 bg-white/[0.04] rounded-xl" />
            </div>
          ))}
        </div>
      ) : erro && places.length === 0 ? (
        <div className="bg-[#0a0a14] rounded-3xl border border-red-500/30 p-10 text-center space-y-3">
          <h3 className="text-lg font-bold text-white">Não deu para carregar os locais</h3>
          <p className="text-xs text-slate-400">Confira sua conexão e tente de novo.</p>
          <button onClick={() => setTentativa((n) => n + 1)} className="px-6 py-2.5 bg-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/20 transition">
            Tentar de novo
          </button>
        </div>
      ) : places.length === 0 ? (
        <div className="bg-[#0a0a14] rounded-3xl border border-white/[0.08] p-14 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mx-auto text-3xl">🧭</div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Nenhum estabelecimento encontrado</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {filtros.cidade || filtros.estado
                ? 'Ainda não temos lugares cadastrados aí com esses filtros. Tire algum filtro ou seja o primeiro a cadastrar um negócio na região.'
                : 'Não encontramos resultados com os filtros atuais. Tente tirar algum deles.'}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={limpar}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:shadow-[0_0_20px_rgba(242,166,90,0.4)] transition"
            >
              Ver todos os locais
            </button>
            <Link href="/comerciante" className="px-6 py-2.5 border border-white/20 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition">
              Cadastrar meu negócio
            </Link>
          </div>
        </div>
      ) : view === 'mapa' ? (
        <MapaLocais places={places} centro={perto ?? undefined} />
      ) : (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity ${loading ? 'opacity-50' : ''}`}
          aria-busy={loading}
        >
          {places.map((place, i) => (
            <PlaceCard key={place.id} place={place} prioridade={i < 3} />
          ))}
        </div>
      )}

      {!primeiraCarga && places.length > 0 && places.length < total && (
        <div className="flex flex-col items-center gap-2 pt-2">
          <p className="hero-mono text-[11px] text-slate-400">
            Mostrando {places.length} de {total}
          </p>
          <button
            onClick={carregarMais}
            disabled={carregandoMais}
            className="px-8 py-3 rounded-2xl border border-white/20 text-sm font-bold text-white hover:bg-white/10 disabled:opacity-60 transition"
          >
            {carregandoMais ? 'Carregando...' : 'Carregar mais'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function LocaisPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 text-xs">Carregando catálogo...</div>}>
      <LocaisContent />
    </Suspense>
  );
}
