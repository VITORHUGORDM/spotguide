'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { UserResponse, LoginInput, RegisterFormInput, AuthResponse } from '@guia/contracts';
import { ApiClient, ApiError } from './api-client';

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<UserResponse>;
  register: (data: RegisterFormInput) => Promise<UserResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CHAVE_TOKEN = 'spotguide_token';
const CHAVE_REFRESH = 'spotguide_refresh';
const CHAVE_USUARIO = 'spotguide_user';

/** Renova o access token quando falta menos que isso para ele vencer. */
const FOLGA_MS = 60_000;

/** Momento (ms) em que o JWT vence, lido do próprio token; null se não der para ler. */
function venceEm(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const renovando = useRef<Promise<void> | null>(null);

  const guardaSessao = useCallback((res: AuthResponse) => {
    setToken(res.accessToken);
    setUser(res.user);
    try {
      localStorage.setItem(CHAVE_TOKEN, res.accessToken);
      localStorage.setItem(CHAVE_REFRESH, res.refreshToken);
      localStorage.setItem(CHAVE_USUARIO, JSON.stringify(res.user));
    } catch {
      // sem localStorage a sessão vale só enquanto a aba estiver aberta
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(CHAVE_TOKEN);
      localStorage.removeItem(CHAVE_REFRESH);
      localStorage.removeItem(CHAVE_USUARIO);
    } catch {
      // nada guardado para remover
    }
  }, []);

  /** Troca o refresh token por um par novo; se a API recusar, a sessão acabou e a pessoa sai. */
  const renova = useCallback((): Promise<void> => {
    renovando.current ??= (async () => {
      let refreshToken: string | null = null;
      try {
        refreshToken = localStorage.getItem(CHAVE_REFRESH);
      } catch {
        // sem localStorage não há como renovar
      }
      if (!refreshToken) return logout();
      try {
        guardaSessao(await ApiClient.refresh(refreshToken));
      } catch (err) {
        // sem rede ou API fora do ar: mantém a sessão e tenta de novo depois
        if (err instanceof ApiError && (err.status === 401 || err.status === 400)) logout();
      }
    })().finally(() => {
      renovando.current = null;
    });
    return renovando.current;
  }, [guardaSessao, logout]);

  // Restaura a sessão salva; se o token já venceu (aba fechada há mais de 15 min), renova antes de liberar as páginas
  useEffect(() => {
    let token: string | null = null;
    let usuario: string | null = null;
    try {
      token = localStorage.getItem(CHAVE_TOKEN);
      usuario = localStorage.getItem(CHAVE_USUARIO);
    } catch (e) {
      console.error('Falha ao restaurar sessão local', e);
    }
    if (!token || !usuario) {
      setIsLoading(false);
      return;
    }
    try {
      setUser(JSON.parse(usuario));
    } catch {
      logout();
      setIsLoading(false);
      return;
    }
    const vence = venceEm(token);
    if (vence !== null && vence - Date.now() > FOLGA_MS) {
      setToken(token);
      setIsLoading(false);
    } else {
      renova().finally(() => setIsLoading(false));
    }
  }, [logout, renova]);

  // Agenda a próxima renovação e confere de novo quando a aba volta a ficar visível (timers param com o PC dormindo)
  useEffect(() => {
    if (!token) return;
    const vence = venceEm(token);
    if (vence === null) return;

    const confere = () => {
      if (vence - Date.now() <= FOLGA_MS) void renova();
    };
    const timer = setTimeout(confere, Math.max(vence - Date.now() - FOLGA_MS, 0));
    const aoVoltar = () => document.visibilityState === 'visible' && confere();
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, [token, renova]);

  const login = async (data: LoginInput) => {
    const res = await ApiClient.login(data);
    guardaSessao(res);
    return res.user;
  };

  const register = async (data: RegisterFormInput) => {
    const res = await ApiClient.register(data);
    guardaSessao(res);
    return res.user;
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
