'use client';

import Link from 'next/link';
import { useAuth } from '../lib/auth-context';
import { Compass, Store, LogIn, LogOut, Sparkles } from 'lucide-react';

export function Navbar() {
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-[#030305]/80 backdrop-blur-2xl border-b border-white/[0.07] transition-all">
      <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-[1.5px] shadow-[0_0_20px_rgba(168,85,247,0.35)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.55)] group-hover:scale-105 transition-all duration-300">
            <div className="w-full h-full bg-[#08080c] rounded-[14px] flex items-center justify-center text-lg">
              🗺️
            </div>
          </div>
          <div>
            <div className="font-black text-lg sm:text-xl text-white tracking-tight leading-none flex items-center gap-1.5">
              SpotGuide
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping shadow-[0_0_8px_#a855f7]" />
            </div>
            <span className="text-[10px] text-purple-300/80 font-bold tracking-[0.15em] uppercase block">
              Guia Turístico & Comercial
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-semibold">
          <Link
            href="/locais"
            className="flex items-center gap-1.5 text-slate-300 hover:text-white transition px-3.5 py-2 rounded-xl hover:bg-white/[0.06]"
          >
            <Compass className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Explorar</span> Locais
          </Link>

          <Link
            href="/comerciante"
            className="flex items-center gap-1.5 px-3.5 py-2 text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 rounded-xl transition border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
          >
            <Store className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Para</span> Comerciantes
          </Link>

          {!isLoading && (
            <div className="flex items-center gap-2 pl-2 border-l border-white/[0.1]">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-200 font-medium bg-white/[0.05] px-3 py-1.5 rounded-xl border border-white/[0.08]">
                    <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden sm:inline max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                    {user.role === 'MERCHANT' && (
                      <span className="px-1.5 py-0.5 text-[9px] bg-purple-500/20 text-purple-300 rounded font-bold uppercase tracking-wider border border-purple-500/30">
                        Comércio
                      </span>
                    )}
                  </div>
                  <button
                    onClick={logout}
                    title="Sair"
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold transition shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:shadow-[0_0_25px_rgba(168,85,247,0.55)] hover:-translate-y-0.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Entrar</span>
                </Link>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
