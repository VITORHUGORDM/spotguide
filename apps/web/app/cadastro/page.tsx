'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { problemaNaSenha, validaNomePessoa, mascaraDocumento, tipoDocumento } from '@guia/contracts/validadores';
import { useAuth } from '../../lib/auth-context';
import { ApiError } from '../../lib/api-client';
import { Campo, entrada, ligacao } from '../../components/form/campo';
import { Mail, Lock, User, UserPlus, AlertCircle, Compass, Store, IdCard, Check, Circle } from 'lucide-react';

type Papel = 'TRAVELER' | 'MERCHANT';

const REGRAS_SENHA = [
  { rotulo: 'Pelo menos 8 caracteres', ok: (s: string) => s.length >= 8 },
  { rotulo: 'Uma letra maiúscula', ok: (s: string) => /[A-Z]/.test(s) },
  { rotulo: 'Uma letra minúscula', ok: (s: string) => /[a-z]/.test(s) },
  { rotulo: 'Um número', ok: (s: string) => /[0-9]/.test(s) },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function CadastroPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [document, setDocument] = useState('');
  const [role, setRole] = useState<Papel>('TRAVELER');
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [doServidor, setDoServidor] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toca = (campo: string) => setTocados((t) => ({ ...t, [campo]: true }));

  // mensagens de cada campo; só aparecem depois que a pessoa sai do campo ou tenta enviar
  const erros = useMemo(() => {
    const e: Record<string, string> = {};
    if (!validaNomePessoa(name)) e.name = 'Informe nome e sobrenome (apenas letras).';
    if (!EMAIL.test(email.trim())) e.email = 'Digite um e-mail válido, como nome@exemplo.com.';
    const senha = problemaNaSenha(password, email.trim());
    if (senha) e.password = senha;
    if (role === 'MERCHANT' && !tipoDocumento(document)) {
      e.document = document ? 'CPF ou CNPJ inválido. Confira os números.' : 'Informe o CPF ou CNPJ do responsável.';
    }
    return e;
  }, [name, email, password, document, role]);

  const mostra = (campo: string) => (tocados[campo] ? erros[campo] : undefined) ?? doServidor[campo];

  const limpaServidor = (campo: string) => setDoServidor(({ [campo]: _, ...resto }) => resto);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (Object.keys(erros).length) {
      setTocados({ name: true, email: true, password: true, document: true });
      setError('Corrija os campos destacados para continuar.');
      return;
    }

    setSubmitting(true);
    try {
      const loggedUser = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        ...(role === 'MERCHANT' && { document }),
      });
      router.push(loggedUser.role === 'MERCHANT' ? '/comerciante' : '/locais');
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.campos).length) {
        setDoServidor(err.campos);
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : 'Falha ao criar conta. Verifique os dados digitados.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const caixa = (erro?: string) =>
    `flex items-center px-4 py-3 bg-white/[0.04] border rounded-2xl focus-within:ring-1 transition ${
      erro ? 'border-red-500/60 focus-within:ring-red-500/30' : 'border-white/[0.1] focus-within:border-purple-500/60 focus-within:ring-purple-500/30'
    }`;
  const semBorda = 'bg-transparent w-full text-xs outline-none text-white placeholder-slate-500';

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-[#0b0a17] text-slate-100 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none -z-0" />

      <div className="w-full max-w-md bg-[#0a0a14]/90 border border-white/[0.1] rounded-3xl p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-purple-500/20 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-block p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-2 shadow-[0_0_20px_rgba(242,166,90,0.3)]">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Criar Nova Conta</h1>
          <p className="text-xs text-slate-400">Junte-se à comunidade SpotGuide como viajante ou comerciante.</p>
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2 p-3.5 bg-red-500/10 text-red-400 text-xs rounded-2xl border border-red-500/20">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <fieldset>
            <legend className="block text-xs font-semibold text-slate-300 mb-2">Qual é o seu objetivo principal?</legend>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ['TRAVELER', Compass, 'Viajante', 'Descobrir locais e avaliar'],
                  ['MERCHANT', Store, 'Comerciante', 'Divulgar estabelecimentos'],
                ] as const
              ).map(([valor, Icone, titulo, texto]) => (
                <button
                  key={valor}
                  type="button"
                  aria-pressed={role === valor}
                  onClick={() => {
                    setRole(valor);
                    limpaServidor('document');
                  }}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                    role === valor
                      ? 'border-purple-500 bg-purple-500/15 text-white shadow-[0_0_20px_rgba(242,166,90,0.25)]'
                      : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Icone className={`w-4 h-4 ${role === valor ? 'text-purple-400' : 'text-slate-400'}`} />
                    {titulo}
                  </div>
                  <span className="text-[10px] text-slate-400">{texto}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <Campo id="cad-nome" rotulo="Nome completo" erro={mostra('name')}>
            <div className={caixa(mostra('name'))}>
              <User className="w-4 h-4 text-purple-400 mr-2.5 flex-shrink-0" />
              <input
                {...ligacao('cad-nome', mostra('name'))}
                type="text"
                autoComplete="name"
                placeholder="Seu nome e sobrenome"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  limpaServidor('name');
                }}
                onBlur={() => toca('name')}
                className={semBorda}
              />
            </div>
          </Campo>

          <Campo id="cad-email" rotulo="E-mail" erro={mostra('email')}>
            <div className={caixa(mostra('email'))}>
              <Mail className="w-4 h-4 text-purple-400 mr-2.5 flex-shrink-0" />
              <input
                {...ligacao('cad-email', mostra('email'))}
                type="email"
                autoComplete="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  limpaServidor('email');
                }}
                onBlur={() => toca('email')}
                className={semBorda}
              />
            </div>
          </Campo>

          {role === 'MERCHANT' && (
            <Campo
              id="cad-documento"
              rotulo="CPF ou CNPJ do responsável"
              erro={mostra('document')}
              dica="Usado só para evitar contas duplicadas. Guardamos apenas um código irreversível, nunca o número."
            >
              <div className={caixa(mostra('document'))}>
                <IdCard className="w-4 h-4 text-purple-400 mr-2.5 flex-shrink-0" />
                <input
                  {...ligacao('cad-documento', mostra('document'))}
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  value={document}
                  onChange={(e) => {
                    setDocument(mascaraDocumento(e.target.value));
                    limpaServidor('document');
                  }}
                  onBlur={() => toca('document')}
                  className={semBorda}
                />
                {tipoDocumento(document) && (
                  <span className="hero-mono text-[10px] text-emerald-400 ml-2 flex-shrink-0">{tipoDocumento(document)} ok</span>
                )}
              </div>
            </Campo>
          )}

          <Campo id="cad-senha" rotulo="Senha" erro={tocados.password && erros.password && !password ? erros.password : doServidor.password}>
            <div className={caixa(doServidor.password)}>
              <Lock className="w-4 h-4 text-purple-400 mr-2.5 flex-shrink-0" />
              <input
                {...ligacao('cad-senha', doServidor.password)}
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  limpaServidor('password');
                }}
                onBlur={() => toca('password')}
                className={semBorda}
              />
            </div>
            <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1" aria-label="Requisitos da senha">
              {REGRAS_SENHA.map((r) => {
                const ok = r.ok(password);
                return (
                  <li key={r.rotulo} className={`flex items-center gap-1.5 text-[11px] ${ok ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {ok ? <Check className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                    {r.rotulo}
                  </li>
                );
              })}
            </ul>
            {tocados.password && password && erros.password && REGRAS_SENHA.every((r) => r.ok(password)) && (
              <p role="alert" className="mt-1.5 text-[11px] text-red-400">
                {erros.password}
              </p>
            )}
          </Campo>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-[#faf6ee] hover:bg-white disabled:opacity-50 text-[#0b0a17] font-bold text-xs rounded-2xl transition shadow-[0_0_25px_rgba(242,166,90,0.4)] mt-2"
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
