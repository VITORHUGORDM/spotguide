'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { Mail, Lock, User, UserPlus, AlertCircle, Compass, Store } from 'lucide-react';

export default function CadastroPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'TRAVELER' | 'MERCHANT'>('TRAVELER');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const loggedUser = await register({ name, email, password, role });
      if (loggedUser.role === 'MERCHANT') {
        router.push('/comerciante');
      } else {
        router.push('/locais');
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao criar conta. Verifique os dados digitados.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-[#030305] text-slate-100 relative overflow-hidden">
      {/* Ambient Cosmic Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none -z-0" />

      <div className="w-full max-w-md bg-[#0a0a14]/90 border border-white/[0.1] rounded-3xl p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl ring-1 ring-purple-500/20 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-block p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Criar Nova Conta
          </h1>
          <p className="text-xs text-slate-400">
            Junte-se à comunidade SpotGuide como viajante ou comerciante.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3.5 bg-red-500/10 text-red-400 text-xs rounded-2xl border border-red-500/20">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Perfil Selection Dark Luxury */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Qual é o seu objetivo principal?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('TRAVELER')}
                className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  role === 'TRAVELER'
                    ? 'border-purple-500 bg-purple-500/15 text-white shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Compass className={`w-4 h-4 ${role === 'TRAVELER' ? 'text-purple-400' : 'text-slate-400'}`} />
                  Viajante
                </div>
                <span className="text-[10px] text-slate-400">Descobrir locais e avaliar</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('MERCHANT')}
                className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  role === 'MERCHANT'
                    ? 'border-purple-500 bg-purple-500/15 text-white shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Store className={`w-4 h-4 ${role === 'MERCHANT' ? 'text-purple-400' : 'text-slate-400'}`} />
                  Comerciante
                </div>
                <span className="text-[10px] text-slate-400">Divulgar estabelecimentos</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nome Completo</label>
            <div className="flex items-center px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl focus-within:border-purple-500/60 focus-within:ring-1 focus-within:ring-purple-500/30 transition">
              <User className="w-4 h-4 text-purple-400 mr-2.5 flex-shrink-0" />
              <input
                type="text"
                required
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent w-full text-xs outline-none text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">E-mail</label>
            <div className="flex items-center px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl focus-within:border-purple-500/60 focus-within:ring-1 focus-within:ring-purple-500/30 transition">
              <Mail className="w-4 h-4 text-purple-400 mr-2.5 flex-shrink-0" />
              <input
                type="email"
                required
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent w-full text-xs outline-none text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Senha (mín. 8 chars, 1 maiúscula, 1 número)
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
            disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-2xl transition shadow-[0_0_25px_rgba(168,85,247,0.4)] mt-2"
          >
            {submitting ? 'Cadastrando...' : 'Criar Minha Conta'}
          </button>
        </form>

        <div className="pt-4 border-t border-white/[0.08] text-center text-xs text-slate-400">
          Já possui conta?{' '}
          <Link href="/login" className="text-purple-400 font-semibold hover:text-purple-300 transition">
            Faça login aqui
          </Link>
        </div>
      </div>
    </div>
  );
}
