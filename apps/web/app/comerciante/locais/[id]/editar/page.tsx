'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../../lib/auth-context';
import { ApiClient } from '../../../../../lib/api-client';
import { CityAutocomplete } from '../../../../../components/city-autocomplete';
import { ArrowLeft, Building2, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

export default function EditarLocalPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { user, token, isLoading } = useAuth();

  const [loadingPlace, setLoadingPlace] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [slug, setSlug] = useState('');

  useEffect(() => {
    if (!id) return;
    ApiClient.getPlaceById(id)
      .then((place) => {
        setName(place.name);
        setDescription(place.description);
        setPhone(place.phone || '');
        setWebsiteUrl(place.websiteUrl || '');
        setStreet(place.street);
        setNumber(place.number);
        setNeighborhood(place.neighborhood);
        setCity(place.city);
        setState(place.state);
        setPostalCode(place.postalCode);
        setLatitude(place.latitude);
        setLongitude(place.longitude);
        setSlug(place.slug);
      })
      .catch((err) => setError('Falha ao carregar dados do local.'))
      .finally(() => setLoadingPlace(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError(null);
    setSubmitting(true);

    try {
      await ApiClient.updatePlace(
        id,
        {
          name,
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
        },
        token
      );

      router.push('/comerciante');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar dados.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loadingPlace) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-xs text-slate-500 bg-[#0b0a17]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span>Carregando dados do estabelecimento...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 bg-[#0b0a17] text-slate-100">
      <div className="space-y-2">
        <Link
          href="/comerciante"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-400 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para o painel do comerciante
        </Link>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Editar Estabelecimento
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Atualize as informações de contato, descrição ou endereço do seu negócio.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-4 bg-red-500/10 text-red-400 text-xs rounded-2xl border border-red-500/20">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-[#0a0a14]/90 p-6 sm:p-8 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
            <Building2 className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Informações Principais</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nome do Estabelecimento *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Descrição Detalhada *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Telefone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/60 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Website Oficial</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/60 transition"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#0a0a14]/90 p-6 sm:p-8 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Endereço e Coordenadas</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Logradouro *</label>
              <input
                type="text"
                required
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
                className="w-full"
                inputClassName="font-medium text-xs sm:text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Estado *</label>
              <input
                type="text"
                required
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
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/60 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Latitude</label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/60 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Longitude</label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/60 transition"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
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
            {submitting ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
