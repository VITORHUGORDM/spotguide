'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { ApiClient } from '../../lib/api-client';
import { PlaceListItem } from '@guia/contracts';
import {
  Store,
  Plus,
  Star,
  MapPin,
  ExternalLink,
  Edit,
  Trash2,
  TrendingUp,
  MessageSquare,
  Building2,
  CheckCircle,
  Lock,
  Mail,
  User,
  AlertCircle,
} from 'lucide-react';

export default function ComerciantePortalPage() {
  const { user, token, login, register, logout, isLoading } = useAuth();

  // Auth Card State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Merchant Places State
  const [places, setPlaces] = useState<PlaceListItem[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchMerchantPlaces = async () => {
    if (!token) return;
    setLoadingPlaces(true);
    try {
      const data = await ApiClient.getMyPlaces(token);
      setPlaces(data);
    } catch (err) {
      console.error('Erro ao buscar locais do comerciante:', err);
    } finally {
      setLoadingPlaces(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === 'MERCHANT') {
      fetchMerchantPlaces();
    }
  }, [token, user]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSubmittingAuth(true);

    try {
      if (authMode === 'login') {
        await login({ email, password });
      } else {
        await register({ name, email, password, role: 'MERCHANT' });
      }
    } catch (err: any) {
      setAuthError(err.message || 'Falha na autenticação');
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleDeletePlace = async (id: string) => {
    if (!token) return;
    if (!confirm('Tem certeza que deseja excluir este estabelecimento? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await ApiClient.deletePlace(id, token);
      setPlaces(places.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir local');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 text-sm bg-[#030305]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span>Carregando informações do comerciante...</span>
        </div>
      </div>
    );
  }

  // Se o usuário já está logado como COMERCIANTE (ou ADMIN)
  if (user && (user.role === 'MERCHANT' || user.role === 'ADMIN')) {
    const totalReviews = places.reduce((acc, p) => acc + (p.totalReviews || 0), 0);
    const avgRating =
      places.length > 0
        ? (places.reduce((acc, p) => acc + (p.averageRating || 0), 0) / places.length).toFixed(1)
        : '0.0';

    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 bg-[#030305] text-slate-100">
        {/* Dashboard Top Header Dark Luxury */}
        <div className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#0a0a14]/90 p-6 sm:p-8 rounded-3xl border border-white/[0.08] shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="relative z-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-300 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full inline-block">
              Portal do Comerciante
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Olá, {user.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Gerencie seus estabelecimentos, acompanhe avaliações e atualize informações em tempo real.
            </p>
          </div>

          <Link
            href="/comerciante/locais/novo"
            className="relative z-10 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs rounded-2xl transition shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Novo Estabelecimento
          </Link>
        </div>

        {/* Metrics Row Dark Luxury */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-[#0a0a14]/90 p-6 rounded-3xl border border-white/[0.08] hover:border-purple-500/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl flex items-center gap-4 transition">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium">Seus Estabelecimentos</span>
              <p className="text-3xl font-black text-white">{places.length}</p>
            </div>
          </div>

          <div className="bg-[#0a0a14]/90 p-6 rounded-3xl border border-white/[0.08] hover:border-amber-500/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl flex items-center gap-4 transition">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Star className="w-7 h-7 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium">Média Geral de Avaliações</span>
              <p className="text-3xl font-black text-amber-400">{avgRating}</p>
            </div>
          </div>

          <div className="bg-[#0a0a14]/90 p-6 rounded-3xl border border-white/[0.08] hover:border-emerald-500/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl flex items-center gap-4 transition">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium">Total de Avaliações Recebidas</span>
              <p className="text-3xl font-black text-white">{totalReviews}</p>
            </div>
          </div>
        </div>

        {/* Places List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
              Seus Estabelecimentos Cadastrados
            </h2>
            <span className="text-xs text-slate-400 font-medium">{places.length} cadastrados</span>
          </div>

          {loadingPlaces ? (
            <div className="p-16 text-center text-slate-500 text-xs bg-[#0a0a14]/60 rounded-3xl border border-white/[0.08]">
              Carregando seus estabelecimentos...
            </div>
          ) : places.length === 0 ? (
            <div className="bg-[#0a0a14]/90 rounded-3xl border border-white/[0.08] p-12 text-center space-y-5 shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto text-3xl shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                🏪
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Nenhum estabelecimento cadastrado</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Você ainda não cadastrou nenhum negócio no SpotGuide. Comece agora para atrair mais clientes e turistas!
                </p>
              </div>
              <Link
                href="/comerciante/locais/novo"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs rounded-2xl transition shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Meu Primeiro Estabelecimento
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place) => (
                <div
                  key={place.id}
                  className="bg-[#0a0a14]/90 rounded-3xl border border-white/[0.08] hover:border-purple-500/40 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col justify-between transition-all duration-300 group"
                >
                  <div>
                    {/* Cover Photo */}
                    <div className="relative h-48 bg-[#0e0e1a] overflow-hidden">
                      {place.coverPhotoUrl ? (
                        <img
                          src={place.coverPhotoUrl}
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl bg-[#0e0e1a] text-slate-600">
                          🏢
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-transparent to-transparent opacity-60" />
                      <span className="absolute top-3 left-3 bg-[#0a0a14]/90 backdrop-blur-md text-purple-300 border border-purple-500/30 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {place.category.name}
                      </span>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white text-base truncate group-hover:text-purple-300 transition">
                          {place.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>
                            {place.averageRating && Number(place.averageRating) > 0
                              ? Number(place.averageRating).toFixed(1)
                              : 'Novo'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        <span>
                          {place.city} - {place.state}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {place.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar Dark Luxury */}
                  <div className="px-5 py-3.5 bg-white/[0.02] border-t border-white/[0.08] flex items-center justify-between gap-2 text-xs">
                    <Link
                      href={`/locais/${place.slug}`}
                      className="text-slate-400 hover:text-purple-400 font-semibold flex items-center gap-1 transition"
                      title="Ver página pública"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Ver Página
                    </Link>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/comerciante/locais/${place.id}/editar`}
                        className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-white/[0.08] rounded-xl border border-white/[0.1] transition flex items-center gap-1 font-semibold"
                      >
                        <Edit className="w-3.5 h-3.5 text-purple-400" />
                        Editar
                      </Link>

                      <button
                        onClick={() => handleDeletePlace(place.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                        title="Excluir estabelecimento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Caso o usuário não esteja logado como comerciante: Landing page informativa Dark Luxury + formulário
  return (
    <div className="space-y-16 pb-20 bg-[#030305] text-slate-100 min-h-screen">
      {/* Hero Section Dark Luxury */}
      <section className="relative py-16 sm:py-24 px-4 overflow-hidden">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-purple-600/20 via-indigo-600/15 to-cyan-500/10 blur-[120px] -z-10 rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-block px-4 py-1.5 bg-purple-500/10 text-purple-300 text-xs font-bold rounded-full uppercase tracking-[0.2em] border border-purple-500/30">
              Para Proprietários & Empreendedores
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
              Faça sua empresa ser descoberta por milhares de{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                clientes e turistas
              </span>
              .
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              O SpotGuide conecta restaurantes, pousadas, cafés e comércios aos viajantes e
              moradores prontos para consumir, com rotas com 1 clique e reputação verificada.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3 p-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-white">Visibilidade Regional</h4>
                  <p className="text-[11px] text-slate-400">
                    Apareça no topo das buscas da sua cidade e no app mobile.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-white">GPS & Rotas Integradas</h4>
                  <p className="text-[11px] text-slate-400">
                    Clientes chegam até sua porta direto pelo Google Maps.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-white">Painel de Gestão</h4>
                  <p className="text-[11px] text-slate-400">
                    Atualize horários, fotos, cardápios e responda avaliações.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-white">Zero Comissões Abusivas</h4>
                  <p className="text-[11px] text-slate-400">
                    Sem intermediários nas suas vendas e no seu lucro.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card Dark Luxury */}
          <div className="lg:col-span-5 bg-[#0a0a14]/90 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/[0.1] backdrop-blur-2xl ring-1 ring-purple-500/20">
            {/* Tabs */}
            <div className="flex border-b border-white/[0.08] mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError(null);
                }}
                className={`flex-1 py-3 text-xs font-bold border-b-2 transition ${
                  authMode === 'login'
                    ? 'border-purple-500 text-purple-400 shadow-[0_2px_10px_rgba(168,85,247,0.4)]'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Acessar Minha Conta
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError(null);
                }}
                className={`flex-1 py-3 text-xs font-bold border-b-2 transition ${
                  authMode === 'register'
                    ? 'border-purple-500 text-purple-400 shadow-[0_2px_10px_rgba(168,85,247,0.4)]'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Cadastrar Comércio
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authError && (
                <div className="flex items-start gap-2 p-3.5 bg-red-500/10 text-red-400 text-xs rounded-2xl border border-red-500/20">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Seu Nome Completo
                  </label>
                  <div className="flex items-center px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl focus-within:border-purple-500/60 focus-within:ring-1 focus-within:ring-purple-500/30 transition">
                    <User className="w-4 h-4 text-purple-400 mr-2.5 flex-shrink-0" />
                    <input
                      type="text"
                      required
                      placeholder="ex: Carlos Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-transparent w-full text-xs outline-none text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  E-mail Comercial
                </label>
                <div className="flex items-center px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl focus-within:border-purple-500/60 focus-within:ring-1 focus-within:ring-purple-500/30 transition">
                  <Mail className="w-4 h-4 text-purple-400 mr-2.5 flex-shrink-0" />
                  <input
                    type="email"
                    required
                    placeholder="contato@seunegocio.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent w-full text-xs outline-none text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Senha {authMode === 'register' && '(mín. 8 chars, 1 maiúscula, 1 número)'}
                </label>
                <div className="flex items-center px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl focus-within:border-purple-500/60 focus-within:ring-1 focus-within:ring-purple-500/30 transition">
                  <Lock className="w-4 h-4 text-purple-400 mr-2.5 flex-shrink-0" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent w-full text-xs outline-none text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingAuth}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-2xl transition shadow-[0_0_25px_rgba(168,85,247,0.4)] mt-3"
              >
                {submittingAuth
                  ? 'Processando...'
                  : authMode === 'login'
                  ? 'Entrar no Painel'
                  : 'Criar Minha Conta de Comerciante'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
