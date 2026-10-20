'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import type { PlaceDetail, UpdatePlaceFormInput } from '@guia/contracts';
import { useAuth } from '../../../../../lib/auth-context';
import { ApiClient } from '../../../../../lib/api-client';
import { ArrowLeft } from 'lucide-react';
import { PhotoManager } from '../../../../../components/photo-manager';
import { FormularioLocal, telefoneParaTela, type ValoresLocal } from '../../../../../components/comerciante/formulario-local';

const paraFormulario = (p: PlaceDetail): ValoresLocal => ({
  name: p.name,
  categoryId: p.category.id,
  description: p.description,
  coverPhotoUrl: '',
  phone: telefoneParaTela(p.phone),
  websiteUrl: p.websiteUrl ?? '',
  priceLevel: p.priceLevel ?? null,
  amenities: p.amenities ?? [],
  postalCode: p.postalCode,
  street: p.street,
  number: p.number,
  neighborhood: p.neighborhood,
  city: p.city,
  state: p.state,
  latitude: String(p.latitude),
  longitude: String(p.longitude),
});

export default function EditarLocalPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { token, isLoading } = useAuth();

  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [loadingPlace, setLoadingPlace] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    ApiClient.getPlaceById(id)
      .then(setPlace)
      .catch(() => setError('Falha ao carregar dados do local.'))
      .finally(() => setLoadingPlace(false));
  }, [id]);

  const enviar = async (dados: Record<string, unknown>) => {
    if (!token) return;
    setError(null);
    setSubmitting(true);
    try {
      await ApiClient.updatePlace(id, dados as UpdatePlaceFormInput, token);
      router.push('/comerciante');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar dados.');
      throw err;
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
        <Link href="/comerciante" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-400 transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para o painel do comerciante
        </Link>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Editar Estabelecimento</h1>
        <p className="text-xs sm:text-sm text-slate-400">Atualize as informações de contato, descrição, preço, comodidades ou endereço do seu negócio.</p>
      </div>

      {place ? (
        <FormularioLocal
          modo="editar"
          inicial={paraFormulario(place)}
          enviando={submitting}
          erroGeral={error}
          rotuloEnviar="Salvar Alterações"
          onEnviar={enviar}
        />
      ) : (
        error && <p className="text-xs text-red-400">{error}</p>
      )}

      {token && place && (
        <div className="mt-8">
          <PhotoManager placeId={id} token={token} fotosIniciais={place.photos ?? []} />
        </div>
      )}
    </div>
  );
}
