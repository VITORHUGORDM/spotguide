'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserResponse, LoginInput, RegisterFormInput } from '@guia/contracts';
import { ApiClient } from './api-client';

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<UserResponse>;
  register: (data: RegisterFormInput) => Promise<UserResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('spotguide_token');
      const storedUser = localStorage.getItem('spotguide_user');
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

  const login = async (data: LoginInput) => {
    const res = await ApiClient.login(data);
    setToken(res.accessToken);
    setUser(res.user);
    localStorage.setItem('spotguide_token', res.accessToken);
    localStorage.setItem('spotguide_user', JSON.stringify(res.user));
    return res.user;
  };

  const register = async (data: RegisterFormInput) => {
    const res = await ApiClient.register(data);
    setToken(res.accessToken);
    setUser(res.user);
    localStorage.setItem('spotguide_token', res.accessToken);
    localStorage.setItem('spotguide_user', JSON.stringify(res.user));
    return res.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('spotguide_token');
    localStorage.removeItem('spotguide_user');
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
