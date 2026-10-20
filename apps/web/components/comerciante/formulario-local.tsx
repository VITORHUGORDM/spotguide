'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import type { CategoryResponse, DayOfWeek } from '@guia/contracts';
import { ESTADOS } from '@guia/contracts/brasil';
import { COMODIDADES, FAIXAS_PRECO } from '@guia/contracts/comodidades';
import {
  coordenadasNoBrasil,
  formataTelefone,
  mascaraTelefone,
  normalizaHorario,
  normalizaTelefone,
  normalizaUrlHttp,
  soDigitos,
  validaCep,
  formataCep,
} from '@guia/contracts/validadores';
import { ApiClient, ApiError } from '../../lib/api-client';
import { CityAutocomplete } from '../city-autocomplete';
import { Campo, entrada, ligacao } from '../form/campo';
import { AlertCircle, Building2, CheckCircle, Clock, Compass, ExternalLink, Loader2, MapPin, Sparkles } from 'lucide-react';

const DIAS: { day: DayOfWeek; label: string }[] = [
  { day: 'MONDAY', label: 'Segunda-feira' },
  { day: 'TUESDAY', label: 'Terça-feira' },
  { day: 'WEDNESDAY', label: 'Quarta-feira' },
  { day: 'THURSDAY', label: 'Quinta-feira' },
  { day: 'FRIDAY', label: 'Sexta-feira' },
  { day: 'SATURDAY', label: 'Sábado' },
  { day: 'SUNDAY', label: 'Domingo' },
];

type Horarios = Record<DayOfWeek, { openTime: string; closeTime: string; isClosed: boolean }>;

const HORARIOS_PADRAO: Horarios = {
  MONDAY: { openTime: '08:00', closeTime: '18:00', isClosed: false },
  TUESDAY: { openTime: '08:00', closeTime: '18:00', isClosed: false },
  WEDNESDAY: { openTime: '08:00', closeTime: '18:00', isClosed: false },
  THURSDAY: { openTime: '08:00', closeTime: '18:00', isClosed: false },
  FRIDAY: { openTime: '08:00', closeTime: '22:00', isClosed: false },
  SATURDAY: { openTime: '10:00', closeTime: '22:00', isClosed: false },
  SUNDAY: { openTime: '10:00', closeTime: '16:00', isClosed: true },
};

export interface ValoresLocal {
  name: string;
  categoryId: string;
  description: string;
  coverPhotoUrl: string;
  phone: string;
  websiteUrl: string;
  priceLevel: number | null;
  amenities: string[];
  postalCode: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  latitude: string;
  longitude: string;
}

export const VALORES_VAZIOS: ValoresLocal = {
  name: '',
  categoryId: '',
  description: '',
  coverPhotoUrl: '',
  phone: '',
  websiteUrl: '',
  priceLevel: null,
  amenities: [],
  postalCode: '',
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state: '',
  latitude: '',
  longitude: '',
};

/** Telefone salvo (só dígitos) volta com máscara; texto antigo fora do padrão aparece como está. */
export const telefoneParaTela = (salvo: string | null | undefined) => (salvo ? (/^\d+$/.test(salvo) ? formataTelefone(salvo) : salvo) : '');

const numero = (v: string) => Number(v.trim().replace(',', '.'));

interface Props {
  modo: 'novo' | 'editar';
  inicial: ValoresLocal;
  categorias?: CategoryResponse[];
  enviando: boolean;
  erroGeral: string | null;
  rotuloEnviar: string;
  /** devolve os campos no formato que a API espera */
  onEnviar: (dados: Record<string, unknown>) => Promise<void>;
}

type CepStatus = 'ocioso' | 'buscando' | 'preenchido' | 'nao-achou' | 'indisponivel';

export function FormularioLocal({ modo, inicial, categorias = [], enviando, erroGeral, rotuloEnviar, onEnviar }: Props) {
  const [v, setV] = useState<ValoresLocal>(inicial);
  const [horarios, setHorarios] = useState<Horarios>(HORARIOS_PADRAO);
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [doServidor, setDoServidor] = useState<Record<string, string>>({});
  const [cepStatus, setCepStatus] = useState<CepStatus>('ocioso');
  const [gps, setGps] = useState<string | null>(null);
  const cepAtual = useRef('');
  const ctrlCep = useRef<AbortController | null>(null);

  const set = <K extends keyof ValoresLocal>(campo: K, valor: ValoresLocal[K]) => {
    setV((atual) => ({ ...atual, [campo]: valor }));
    setDoServidor(({ [campo]: _, ...resto }) => resto);
  };
  const toca = (campo: string) => setTocados((t) => ({ ...t, [campo]: true }));

  // ---------- regras do formulário (a API repete todas; aqui é só para avisar na hora) ----------
  const validar = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (v.name.trim().length < 2) e.name = 'Informe o nome do estabelecimento.';
    if (modo === 'novo' && !v.categoryId) e.categoryId = 'Escolha uma categoria.';
    if (v.description.trim().length < 10) e.description = 'Descreva em pelo menos 10 caracteres.';
    if (v.phone.trim() && !normalizaTelefone(v.phone)) e.phone = 'Telefone inválido. Use DDD + número, ex.: (54) 99999-0000.';
    if (v.websiteUrl.trim() && !normalizaUrlHttp(v.websiteUrl)) e.websiteUrl = 'Link inválido. Use algo como https://seusite.com.br.';
    if (modo === 'novo' && v.coverPhotoUrl.trim() && !normalizaUrlHttp(v.coverPhotoUrl)) e.coverPhotoUrl = 'Link da imagem inválido.';
    if (!validaCep(v.postalCode)) e.postalCode = 'CEP inválido. Use 8 dígitos, ex.: 95670-000.';
    if (v.street.trim().length < 2) e.street = 'Informe a rua.';
    if (!v.number.trim()) e.number = 'Informe o número (ou marque "sem número").';
    if (v.neighborhood.trim().length < 2) e.neighborhood = 'Informe o bairro.';
    if (!v.state) e.state = 'Escolha o estado.';
    if (v.city.trim().length < 2) e.city = 'Informe a cidade.';
    const lat = numero(v.latitude);
    const lng = numero(v.longitude);
    if (!v.latitude.trim() || !v.longitude.trim()) {
      e.latitude = 'Informe a posição no mapa (use o GPS ou cole as coordenadas).';
    } else if (!coordenadasNoBrasil(lat, lng)) {
      e.latitude = 'Essas coordenadas estão fora do Brasil. Confira latitude e longitude.';
    }
    if (modo === 'novo') {
      DIAS.forEach(({ day }, i) => {
        const h = horarios[day];
        if (h.isClosed) return;
        if (!normalizaHorario(h.openTime) || !normalizaHorario(h.closeTime)) e[`hours.${i}`] = 'Informe a abertura e o fechamento.';
        else if (normalizaHorario(h.openTime) === normalizaHorario(h.closeTime)) e[`hours.${i}`] = 'Abertura e fechamento não podem ser iguais.';
      });
    }
    return e;
  };

  const erros = validar();
  const mostra = (campo: string) => doServidor[campo] ?? (tocados[campo] ? erros[campo] : undefined);
  // a API devolve "latitude" ou "longitude"; os dois campos dividem a mesma mensagem
  const erroCoord = mostra('latitude') ?? doServidor.longitude;

  // ---------- CEP: com 8 dígitos, preenche o endereço ----------
  const aoMudarCep = async (texto: string) => {
    const mascarado = formataCep(texto);
    set('postalCode', mascarado);
    setCepStatus('ocioso');
    const digitos = soDigitos(mascarado);
    if (digitos.length !== 8 || !validaCep(digitos) || digitos === cepAtual.current) return;

    cepAtual.current = digitos;
    ctrlCep.current?.abort();
    const ctrl = (ctrlCep.current = new AbortController());
    setCepStatus('buscando');
    try {
      const achado = await ApiClient.buscaCep(digitos, ctrl.signal);
      if (!achado) return setCepStatus('nao-achou');
      setV((atual) => ({
        ...atual,
        street: achado.street || atual.street,
        neighborhood: achado.neighborhood || atual.neighborhood,
        city: achado.city,
        state: achado.state,
      }));
      setCepStatus('preenchido');
    } catch (err) {
      if (!ctrl.signal.aborted) setCepStatus('indisponivel');
    }
  };

  const usarGps = () => {
    setGps(null);
    if (!('geolocation' in navigator)) return setGps('Seu navegador não tem geolocalização.');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set('latitude', pos.coords.latitude.toFixed(6));
        set('longitude', pos.coords.longitude.toFixed(6));
        toca('latitude');
      },
      (err) => setGps(`Não foi possível obter sua localização: ${err.message}`),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const alternaComodidade = (id: string) =>
    set('amenities', v.amenities.includes(id) ? v.amenities.filter((a) => a !== id) : [...v.amenities, id]);

  // ---------- envio ----------
  const enviar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const pendentes = Object.keys(erros);
    if (pendentes.length) {
      setTocados(Object.fromEntries(pendentes.map((c) => [c, true])));
      const primeiro = pendentes[0];
      document.getElementById(`lf-${primeiro.replace('.', '-')}`)?.focus();
      return;
    }

    const dados: Record<string, unknown> = {
      name: v.name.trim(),
      description: v.description.trim(),
      phone: v.phone.trim(),
      websiteUrl: v.websiteUrl.trim(),
      priceLevel: v.priceLevel,
      amenities: v.amenities,
      street: v.street.trim(),
      number: v.number.trim(),
      neighborhood: v.neighborhood.trim(),
      city: v.city.trim(),
      state: v.state,
      postalCode: v.postalCode,
      latitude: numero(v.latitude),
      longitude: numero(v.longitude),
    };
    if (modo === 'novo') {
      dados.categoryId = v.categoryId;
      dados.coverPhotoUrl = v.coverPhotoUrl.trim();
      dados.hours = DIAS.map(({ day }) => ({
        day,
        isClosed: horarios[day].isClosed,
        openTime: horarios[day].isClosed ? null : horarios[day].openTime,
        closeTime: horarios[day].isClosed ? null : horarios[day].closeTime,
      }));
    }

    try {
      await onEnviar(dados);
    } catch (err) {
      // a API apontou campos que o formulário não pegou (cidade fora do estado, coordenadas...)
      if (err instanceof ApiError && Object.keys(err.campos).length) {
        // "hours.2.openTime" -> "hours.2": cada dia mostra uma mensagem só
        const campos: Record<string, string> = {};
        for (const [caminho, msg] of Object.entries(err.campos)) {
          const chave = caminho.startsWith('hours.') ? caminho.split('.').slice(0, 2).join('.') : caminho;
          campos[chave] ??= msg;
        }
        setDoServidor(campos);
        document.getElementById(`lf-${Object.keys(campos)[0].replace('.', '-')}`)?.focus();
      }
      throw err;
    }
  };

  const secao = 'bg-[#0a0a14]/90 p-6 sm:p-8 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-6';
  const pilula = (ativo: boolean) =>
    `px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
      ativo ? 'bg-[#faf6ee] text-[#0b0a17] border-[#faf6ee]' : 'bg-white/[0.04] text-slate-300 border-white/[0.08] hover:bg-white/[0.08]'
    }`;

  return (
    <form onSubmit={enviar} className="space-y-8" noValidate>
      {erroGeral && (
        <div role="alert" className="flex items-start gap-2 p-4 bg-red-500/10 text-red-400 text-xs rounded-2xl border border-red-500/20">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{erroGeral}</span>
        </div>
      )}

      {/* 1. Informações gerais */}
      <section className={secao}>
        <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
          <Building2 className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-bold text-white">Informações gerais</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo id="lf-name" rotulo="Nome do estabelecimento" obrigatorio erro={mostra('name')} className="sm:col-span-2">
            <input
              {...ligacao('lf-name', mostra('name'))}
              type="text"
              maxLength={150}
              placeholder="ex: Bistrô da Serra, Pousada das Hortênsias"
              value={v.name}
              onChange={(e) => set('name', e.target.value)}
              onBlur={() => toca('name')}
              className={entrada(mostra('name'))}
            />
          </Campo>

          {modo === 'novo' && (
            <>
              <Campo id="lf-categoryId" rotulo="Categoria" obrigatorio erro={mostra('categoryId')}>
                <select
                  {...ligacao('lf-categoryId', mostra('categoryId'))}
                  value={v.categoryId}
                  onChange={(e) => set('categoryId', e.target.value)}
                  onBlur={() => toca('categoryId')}
                  className={`${entrada(mostra('categoryId'))} bg-[#0e0e1a]`}
                >
                  <option value="">Escolha...</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0e0e1a]">
                      {c.name}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo id="lf-coverPhotoUrl" rotulo="Foto de capa (link da imagem)" erro={mostra('coverPhotoUrl')} dica="Depois de salvar você pode enviar fotos do seu computador.">
                <input
                  {...ligacao('lf-coverPhotoUrl', mostra('coverPhotoUrl'))}
                  type="text"
                  inputMode="url"
                  placeholder="https://exemplo.com/foto.jpg"
                  value={v.coverPhotoUrl}
                  onChange={(e) => set('coverPhotoUrl', e.target.value)}
                  onBlur={() => toca('coverPhotoUrl')}
                  className={entrada(mostra('coverPhotoUrl'))}
                />
              </Campo>
            </>
          )}

          <Campo
            id="lf-description"
            rotulo="Descrição"
            obrigatorio
            erro={mostra('description')}
            dica={`${v.description.trim().length}/2000 · conte a atmosfera, as especialidades e os diferenciais.`}
            className="sm:col-span-2"
          >
            <textarea
              {...ligacao('lf-description', mostra('description'))}
              rows={4}
              maxLength={2000}
              value={v.description}
              onChange={(e) => set('description', e.target.value)}
              onBlur={() => toca('description')}
              className={entrada(mostra('description'))}
            />
          </Campo>

          <Campo id="lf-phone" rotulo="Telefone ou WhatsApp" erro={mostra('phone')}>
            <input
              {...ligacao('lf-phone', mostra('phone'))}
              type="tel"
              autoComplete="tel-national"
              placeholder="(54) 99999-0000"
              value={v.phone}
              onChange={(e) => set('phone', mascaraTelefone(e.target.value))}
              onBlur={() => toca('phone')}
              className={entrada(mostra('phone'))}
            />
          </Campo>

          <Campo id="lf-websiteUrl" rotulo="Site ou Instagram" erro={mostra('websiteUrl')}>
            <input
              {...ligacao('lf-websiteUrl', mostra('websiteUrl'))}
              type="text"
              inputMode="url"
              placeholder="instagram.com/seunegocio"
              value={v.websiteUrl}
              onChange={(e) => set('websiteUrl', e.target.value)}
              onBlur={() => toca('websiteUrl')}
              className={entrada(mostra('websiteUrl'))}
            />
          </Campo>
        </div>
      </section>

      {/* 2. Preço e comodidades */}
      <section className={secao}>
        <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
          <Sparkles className="w-5 h-5 text-[#f2a65a]" />
          <h2 className="text-base font-bold text-white">Preço e comodidades</h2>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold text-slate-300">Faixa de preço</legend>
          <div className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={v.priceLevel === null} onClick={() => set('priceLevel', null)} className={pilula(v.priceLevel === null)}>
              Não informar
            </button>
            {FAIXAS_PRECO.map((f) => (
              <button key={f.nivel} type="button" aria-pressed={v.priceLevel === f.nivel} onClick={() => set('priceLevel', f.nivel)} className={pilula(v.priceLevel === f.nivel)}>
                <span className="font-mono">{f.simbolo}</span> <span className="font-medium opacity-80">{f.rotulo}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold text-slate-300">O que o seu local oferece</legend>
          <div className="flex flex-wrap gap-2">
            {COMODIDADES.map((c) => (
              <button key={c.id} type="button" aria-pressed={v.amenities.includes(c.id)} onClick={() => alternaComodidade(c.id)} className={pilula(v.amenities.includes(c.id))}>
                {c.rotulo}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">Quem filtra por essas opções só vê locais que marcaram todas.</p>
        </fieldset>
      </section>

      {/* 3. Endereço */}
      <section className={secao}>
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Endereço e localização</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
          <Campo
            id="lf-postalCode"
            rotulo="CEP"
            obrigatorio
            erro={mostra('postalCode')}
            className="sm:col-span-2"
            dica={
              cepStatus === 'preenchido'
                ? 'Endereço preenchido. Confira e informe o número.'
                : cepStatus === 'nao-achou'
                  ? 'CEP não encontrado. Preencha o endereço à mão.'
                  : cepStatus === 'indisponivel'
                    ? 'Não conseguimos consultar o CEP agora. Preencha à mão.'
                    : 'Digite o CEP e preenchemos o resto.'
            }
          >
            <div className="relative">
              <input
                {...ligacao('lf-postalCode', mostra('postalCode'))}
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="95670-000"
                value={v.postalCode}
                onChange={(e) => aoMudarCep(e.target.value)}
                onBlur={() => toca('postalCode')}
                className={entrada(mostra('postalCode'))}
              />
              {cepStatus === 'buscando' && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-purple-400" />}
            </div>
          </Campo>

          <Campo id="lf-street" rotulo="Rua / logradouro" obrigatorio erro={mostra('street')} className="sm:col-span-3">
            <input
              {...ligacao('lf-street', mostra('street'))}
              type="text"
              autoComplete="address-line1"
              value={v.street}
              onChange={(e) => set('street', e.target.value)}
              onBlur={() => toca('street')}
              className={entrada(mostra('street'))}
            />
          </Campo>

          <Campo id="lf-number" rotulo="Número" obrigatorio erro={mostra('number')}>
            <input
              {...ligacao('lf-number', mostra('number'))}
              type="text"
              maxLength={20}
              placeholder="1250"
              value={v.number}
              onChange={(e) => set('number', e.target.value)}
              onBlur={() => toca('number')}
              className={entrada(mostra('number'))}
            />
            <label className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={v.number.toLowerCase() === 's/n'}
                onChange={(e) => set('number', e.target.checked ? 's/n' : '')}
                className="accent-purple-500"
              />
              Sem número
            </label>
          </Campo>

          <Campo id="lf-neighborhood" rotulo="Bairro" obrigatorio erro={mostra('neighborhood')} className="sm:col-span-2">
            <input
              {...ligacao('lf-neighborhood', mostra('neighborhood'))}
              type="text"
              value={v.neighborhood}
              onChange={(e) => set('neighborhood', e.target.value)}
              onBlur={() => toca('neighborhood')}
              className={entrada(mostra('neighborhood'))}
            />
          </Campo>

          <Campo id="lf-state" rotulo="Estado" obrigatorio erro={mostra('state')} className="sm:col-span-2">
            <select
              {...ligacao('lf-state', mostra('state'))}
              value={v.state}
              onChange={(e) => {
                set('state', e.target.value);
                set('city', '');
              }}
              onBlur={() => toca('state')}
              className={`${entrada(mostra('state'))} bg-[#0e0e1a]`}
            >
              <option value="">Escolha...</option>
              {ESTADOS.map((e) => (
                <option key={e.uf} value={e.uf} className="bg-[#0e0e1a]">
                  {e.nome} ({e.uf})
                </option>
              ))}
            </select>
          </Campo>

          <Campo id="lf-city" rotulo="Cidade" obrigatorio erro={mostra('city')} className="sm:col-span-2">
            <div className={`flex items-center px-4 py-3 bg-white/[0.04] border rounded-2xl ${mostra('city') ? 'border-red-500/60' : 'border-white/[0.1] focus-within:border-purple-500/60'}`}>
              <CityAutocomplete
                value={v.city}
                uf={v.state || undefined}
                onChange={(c) => set('city', c)}
                onSelect={(cidade, estado) => {
                  set('city', cidade);
                  set('state', estado);
                }}
                placeholder={v.state ? `Cidade em ${v.state}` : 'Digite a cidade'}
                className="w-full"
                inputClassName="font-medium text-xs sm:text-sm text-white"
              />
            </div>
          </Campo>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
          <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={usarGps}
              className="px-3.5 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              Usar minha localização atual
            </button>
            {coordenadasNoBrasil(numero(v.latitude), numero(v.longitude)) && (
              <a
                href={`https://www.google.com/maps?q=${numero(v.latitude)},${numero(v.longitude)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#f2a65a] hover:underline inline-flex items-center gap-1"
              >
                Conferir no mapa <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {gps && <span className="text-xs text-amber-300">{gps}</span>}
          </div>

          <Campo id="lf-latitude" rotulo="Latitude" obrigatorio erro={erroCoord} dica="Estando no local, use o botão acima. Ex.: -29.378800">
            <input
              {...ligacao('lf-latitude', erroCoord)}
              type="text"
              inputMode="decimal"
              placeholder="-29.378800"
              value={v.latitude}
              onChange={(e) => set('latitude', e.target.value)}
              onBlur={() => toca('latitude')}
              className={entrada(erroCoord)}
            />
          </Campo>
          <Campo id="lf-longitude" rotulo="Longitude" obrigatorio dica="Ex.: -50.873800">
            <input
              id="lf-longitude"
              type="text"
              inputMode="decimal"
              placeholder="-50.873800"
              value={v.longitude}
              onChange={(e) => set('longitude', e.target.value)}
              onBlur={() => toca('latitude')}
              className={entrada(erroCoord)}
            />
          </Campo>
        </div>
      </section>

      {/* 4. Horários (só no cadastro: a edição de horários ainda não existe na API) */}
      {modo === 'novo' && (
        <section className={`${secao} !space-y-4`}>
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
            <Clock className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Horários de atendimento</h2>
          </div>

          <div className="space-y-3">
            {DIAS.map(({ day, label }, i) => {
              const erro = mostra(`hours.${i}`);
              return (
                <div key={day} className="p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label className="flex items-center gap-3 w-44 text-xs font-semibold text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={horarios[day].isClosed}
                        onChange={(e) => setHorarios({ ...horarios, [day]: { ...horarios[day], isClosed: e.target.checked } })}
                        className="rounded accent-purple-500 w-4 h-4"
                      />
                      {label}
                    </label>

                    {horarios[day].isClosed ? (
                      <span className="text-xs text-red-400 font-semibold px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-xl">Fechado neste dia</span>
                    ) : (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">Das</span>
                        <input
                          id={`lf-hours-${i}`}
                          type="time"
                          aria-label={`${label}: abertura`}
                          value={horarios[day].openTime}
                          onChange={(e) => setHorarios({ ...horarios, [day]: { ...horarios[day], openTime: e.target.value } })}
                          className="px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-center text-white outline-none focus:border-purple-500 [color-scheme:dark]"
                        />
                        <span className="text-slate-400">às</span>
                        <input
                          type="time"
                          aria-label={`${label}: fechamento`}
                          value={horarios[day].closeTime}
                          onChange={(e) => setHorarios({ ...horarios, [day]: { ...horarios[day], closeTime: e.target.value } })}
                          className="px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-center text-white outline-none focus:border-purple-500 [color-scheme:dark]"
                        />
                      </div>
                    )}
                  </div>
                  {erro && (
                    <p role="alert" className="text-[11px] text-red-400">
                      {erro}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500">Para um horário que passa da meia-noite (ex.: 18:00 às 02:00), basta colocar o fechamento menor que a abertura.</p>
        </section>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Link href="/comerciante" className="px-6 py-3.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-2xl transition">
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={enviando}
          className="px-8 py-3.5 bg-[#faf6ee] hover:bg-white disabled:opacity-50 text-[#0b0a17] font-bold text-xs rounded-2xl transition shadow-[0_0_25px_rgba(242,166,90,0.4)] flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          {enviando ? 'Salvando...' : rotuloEnviar}
        </button>
      </div>
    </form>
  );
}
