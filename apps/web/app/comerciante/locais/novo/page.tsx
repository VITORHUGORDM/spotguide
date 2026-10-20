'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { CategoryResponse, CreatePlaceFormInput } from '@guia/contracts';
import { useAuth } from '../../../../lib/auth-context';
import { ApiClient } from '../../../../lib/api-client';
import { FormularioLocal, VALORES_VAZIOS } from '../../../../components/comerciante/formulario-local';
import { ArrowLeft, Building2 } from 'lucide-react';

export default function NovoLocalPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ApiClient.getCategories()
      .then(setCategories)
      .catch((e) => console.error(e))
      .finally(() => setLoadingCats(false));
  }, []);

  const enviar = async (dados: Record<string, unknown>) => {
    if (!token) return;
    setError(null);
    setSubmitting(true);
    try {
      const created = await ApiClient.createPlace(dados as unknown as CreatePlaceFormInput, token);
      router.push(`/comerciante/locais/${created.id}/editar?novo=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar local. Verifique os dados.');
      throw err;
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
      <div className="max-w-md mx-auto my-16 p-8 bg-[#0a0a14]/90 border border-white/[0.08] rounded-3xl text-center space-y-4 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
        <Building2 className="w-12 h-12 text-purple-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Área Exclusiva de Comerciantes</h2>
        <p className="text-xs text-slate-400">Você precisa estar conectado em uma conta de comerciante para cadastrar novos locais.</p>
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
      <div className="space-y-2">
        <Link href="/comerciante" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-400 transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para o painel do comerciante
        </Link>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Cadastrar Novo Estabelecimento</h1>
        <p className="text-xs sm:text-sm text-slate-400">Preencha as informações do seu comércio ou atração para começar a receber visitantes.</p>
      </div>

      <FormularioLocal
        modo="novo"
        inicial={{ ...VALORES_VAZIOS, categoryId: categories[0]?.id ?? '' }}
        categorias={categories}
        enviando={submitting}
        erroGeral={error}
        rotuloEnviar="Publicar Estabelecimento"
        onEnviar={enviar}
      />
    </div>
  );
}
