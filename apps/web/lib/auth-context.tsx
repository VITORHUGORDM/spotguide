'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { UserResponse, LoginInput, RegisterFormInput } from '@guia/contracts';
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

const TOKEN_KEY = 'spotguide_token';
const REFRESH_KEY = 'spotguide_refresh';
const USER_KEY = 'spotguide_user';
// renova um minuto antes de vencer (o token de acesso dura 15 min)
const MARGEM_MS = 60_000;
const TENTAR_DE_NOVO_MS = 30_000;

/** Momento (ms) em que o JWT vence; 0 se não der para ler. */
function venceEm(jwt: string): number {
  try {
    const base64 = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)).exp * 1000;
  } catch {
    return 0;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Falha ao restaurar sessão local', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Troca o refresh token por um novo token de acesso. Só um 401 (refresh vencido ou inválido) encerra
  // a sessão; rede fora do ar ou limite de pedidos tentam de novo, sem deslogar ninguém.
  const renova = useCallback(async () => {
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (!refresh) return logout(); // sessão antiga, anterior à renovação
    try {
      const { accessToken } = await ApiClient.refresh(refresh);
      localStorage.setItem(TOKEN_KEY, accessToken);
      setToken(accessToken);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return logout();
      setTimeout(renova, TENTAR_DE_NOVO_MS);
    }
  }, [logout]);

  // agenda a renovação pelo vencimento real do token; ao voltar para a aba (ou ao acordar o
  // computador) confere de novo, porque o temporizador não roda com a aba suspensa
  useEffect(() => {
    if (!token) return;
    const faltam = () => venceEm(token) - Date.now() - MARGEM_MS;
    const timer = setTimeout(renova, Math.max(faltam(), 0));
    const aoVoltar = () => {
      if (document.visibilityState === 'visible' && faltam() <= 0) renova();
    };
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, [token, renova]);

  const guardaSessao = (res: { accessToken: string; refreshToken: string; user: UserResponse }) => {
    setToken(res.accessToken);
    setUser(res.user);
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    localStorage.setItem(REFRESH_KEY, res.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    return res.user;
  };

  const login = async (data: LoginInput) => guardaSessao(await ApiClient.login(data));
  const register = async (data: RegisterFormInput) => guardaSessao(await ApiClient.register(data));

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
