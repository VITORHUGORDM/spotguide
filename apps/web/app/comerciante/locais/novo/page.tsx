'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../lib/auth-context';
import { ApiClient } from '../../../../lib/api-client';
import { CategoryResponse, DayOfWeek } from '@guia/contracts';
import { CityAutocomplete } from '../../../../components/city-autocomplete';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  Phone,
  Globe,
  Camera,
  Compass,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

const DAYS_CONFIG: { day: DayOfWeek; label: string }[] = [
  { day: 'MONDAY', label: 'Segunda-feira' },
  { day: 'TUESDAY', label: 'Terça-feira' },
  { day: 'WEDNESDAY', label: 'Quarta-feira' },
  { day: 'THURSDAY', label: 'Quinta-feira' },
  { day: 'FRIDAY', label: 'Sexta-feira' },
  { day: 'SATURDAY', label: 'Sábado' },
  { day: 'SUNDAY', label: 'Domingo' },
];

export default function NovoLocalPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Address
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [latitude, setLatitude] = useState<number>(-23.5505);
  const [longitude, setLongitude] = useState<number>(-46.6333);

  // Hours
  const [hours, setHours] = useState<
    Record<DayOfWeek, { openTime: string; closeTime: string; isClosed: boolean }>
  >({
    MONDAY: { openTime: '08:00', closeTime: '18:00', isClosed: false },
    TUESDAY: { openTime: '08:00', closeTime: '18:00', isClosed: false },
    WEDNESDAY: { openTime: '08:00', closeTime: '18:00', isClosed: false },
    THURSDAY: { openTime: '08:00', closeTime: '18:00', isClosed: false },
    FRIDAY: { openTime: '08:00', closeTime: '22:00', isClosed: false },
    SATURDAY: { openTime: '10:00', closeTime: '22:00', isClosed: false },
    SUNDAY: { openTime: '10:00', closeTime: '16:00', isClosed: true },
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ApiClient.getCategories()
      .then((data) => {
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoadingCats(false));
  }, []);

  const handleGetCoordinates = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(6)));
          setLongitude(Number(pos.coords.longitude.toFixed(6)));
        },
        (err) => {
          alert('Não foi possível obter sua localização: ' + err.message);
        }
      );
    } else {
      alert('Geolocalização não é suportada pelo seu navegador.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError(null);
    setSubmitting(true);

    try {
      const formattedHours = DAYS_CONFIG.map(({ day }) => ({
        day,
        openTime: hours[day].isClosed ? null : hours[day].openTime,
        closeTime: hours[day].isClosed ? null : hours[day].closeTime,
        isClosed: hours[day].isClosed,
      }));

      const created = await ApiClient.createPlace(
        {
          name,
          categoryId,
          description,
          phone: phone || undefined,
          websiteUrl: websiteUrl || undefined,
          street,
          number,
          neighborhood,
          city,
          state,
          postalCode,
          latitude: Number(latitude),
          longitude: Number(longitude),
          coverPhotoUrl: coverPhotoUrl || undefined,
          hours: formattedHours,
        },
        token
      );

      router.push(`/locais/${created.slug}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar local. Verifique os dados.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loadingCats) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-xs text-slate-500 bg-[#0b0a17]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span>Carregando formulário...</span>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'MERCHANT' && user.role !== 'ADMIN')) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[#0a0a14]/90 border border-white/[0.08] rounded-3xl text-center space-y-4 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <Building2 className="w-12 h-12 text-purple-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Área Exclusiva de Comerciantes</h2>
        <p className="text-xs text-slate-400">
          Você precisa estar conectado em uma conta de comerciante para cadastrar novos locais.
        </p>
        <Link
          href="/comerciante"
          className="inline-block px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl hover:from-purple-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(242,166,90,0.35)] transition"
        >
          Acessar Portal do Comerciante
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 bg-[#0b0a17] text-slate-100">
      {/* Top Header */}
      <div className="space-y-2">
        <Link
          href="/comerciante"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-400 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para o painel do comerciante
        </Link>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Cadastrar Novo Estabelecimento
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Preencha as informações do seu comércio ou atração para começar a receber visitantes.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-4 bg-red-500/10 text-red-400 text-xs rounded-2xl border border-red-500/20">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Bloco 1: Informações Gerais Dark Luxury */}
        <div className="bg-[#0a0a14]/90 p-6 sm:p-8 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
            <Building2 className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">1. Informações Gerais</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nome do Estabelecimento *
              </label>
              <input
                type="text"
                required
                placeholder="ex: Bistrô da Serra, Pousada das Hortênsias"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Categoria *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 bg-[#0e0e1a] border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-white outline-none focus:border-purple-500/60 transition"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0e0e1a] text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Foto de Capa (URL pública da imagem)
              </label>
              <input
                type="url"
                placeholder="https://exemplo.com/foto-do-local.jpg"
                value={coverPhotoUrl}
                onChange={(e) => setCoverPhotoUrl(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Descrição Detalhada * (mínimo 10 caracteres)
              </label>
              <textarea
                required
                rows={3}
                placeholder="Descreva a atmosfera, especialidades gastronômicas, diferenciais de atendimento ou serviços..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Telefone ou WhatsApp
              </label>
              <input
                type="text"
                placeholder="(54) 99999-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Website ou Instagram
              </label>
              <input
                type="url"
                placeholder="https://instagram.com/seunegocio"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Endereço & Localização GPS Dark Luxury */}
        <div className="bg-[#0a0a14]/90 p-6 sm:p-8 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">2. Endereço e Coordenadas GPS</h2>
            </div>
            <button
              type="button"
              onClick={handleGetCoordinates}
              className="px-3.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              Usar GPS Atual
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Rua / Logradouro *</label>
              <input
                type="text"
                required
                placeholder="ex: Av. Borges de Medeiros"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/60 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Número *</label>
              <input
                type="text"
                required
                placeholder="ex: 1250"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/60 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bairro *</label>
              <input
                type="text"
                required
                placeholder="ex: Centro"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/60 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cidade *</label>
              <CityAutocomplete
                value={city}
                onChange={(c) => setCity(c)}
                onSelect={(selectedCity, selectedState) => {
                  setCity(selectedCity);
                  if (selectedState) setState(selectedState);
                }}
                placeholder="ex: Gramado"
                className="w-full"
                inputClassName="font-medium text-xs sm:text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Estado (UF) *</label>
              <input
                type="text"
                required
                placeholder="ex: RS"
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/60 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">CEP *</label>
              <input
                type="text"
                required
                placeholder="ex: 95670-000"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/60 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Latitude GPS *</label>
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/60 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Longitude GPS *</label>
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/60 transition"
              />
            </div>
          </div>
        </div>

        {/* Bloco 3: Horários de Atendimento Dark Luxury */}
        <div className="bg-[#0a0a14]/90 p-6 sm:p-8 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
            <Clock className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">3. Horários de Atendimento</h2>
          </div>

          <div className="space-y-3">
            {DAYS_CONFIG.map(({ day, label }) => (
              <div
                key={day}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl"
              >
                <div className="flex items-center gap-3 w-44">
                  <input
                    type="checkbox"
                    id={`closed-${day}`}
                    checked={hours[day].isClosed}
                    onChange={(e) =>
                      setHours({
                        ...hours,
                        [day]: { ...hours[day], isClosed: e.target.checked },
                      })
                    }
                    className="rounded accent-purple-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor={`closed-${day}`} className="text-xs font-semibold text-slate-300 cursor-pointer">
                    {label}
                  </label>
                </div>

                {hours[day].isClosed ? (
                  <span className="text-xs text-red-400 font-semibold px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-xl">
                    Fechado neste dia
                  </span>
                ) : (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Das</span>
                    <input
                      type="text"
                      placeholder="08:00"
                      value={hours[day].openTime}
                      onChange={(e) =>
                        setHours({
                          ...hours,
                          [day]: { ...hours[day], openTime: e.target.value },
                        })
                      }
                      className="w-20 px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-center text-white outline-none focus:border-purple-500"
                    />
                    <span className="text-slate-400">às</span>
                    <input
                      type="text"
                      placeholder="18:00"
                      value={hours[day].closeTime}
                      onChange={(e) =>
                        setHours({
                          ...hours,
                          [day]: { ...hours[day], closeTime: e.target.value },
                        })
                      }
                      className="w-20 px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-center text-white outline-none focus:border-purple-500"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/comerciante"
            className="px-6 py-3.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-2xl transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 bg-[#faf6ee] hover:bg-white disabled:opacity-50 text-[#0b0a17] font-bold text-xs rounded-2xl transition shadow-[0_0_25px_rgba(242,166,90,0.4)] flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {submitting ? 'Salvando...' : 'Publicar Estabelecimento'}
          </button>
        </div>
      </form>
    </div>
  );
}
