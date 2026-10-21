'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-context';
import { ApiClient } from './api-client';

interface FavoritesContextType {
  ids: ReadonlySet<string>;
  /** false se não há login (quem chama manda a pessoa entrar) */
  toggle: (placeId: string) => Promise<boolean>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [ids, setIds] = useState<ReadonlySet<string>>(new Set());

  // uma consulta por sessão em vez de uma por card
  useEffect(() => {
    if (!token) return setIds(new Set());
    let vivo = true;
    ApiClient.getFavorites(token)
      .then((lista) => vivo && setIds(new Set(lista.map((p) => p.id))))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [token]);

  const toggle = useCallback(
    async (placeId: string) => {
      if (!token) return false;
      const quer = !ids.has(placeId);
      const aplica = (favorito: boolean) =>
        setIds((atual) => {
          const novo = new Set(atual);
          if (favorito) novo.add(placeId);
          else novo.delete(placeId);
          return novo;
        });
      aplica(quer); // otimista: o coração muda na hora
      try {
        await ApiClient.setFavorite(placeId, quer, token);
      } catch (err) {
        aplica(!quer);
        throw err;
      }
      return true;
    },
    [token, ids]
  );

  return <FavoritesContext.Provider value={{ ids, toggle }}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites deve ser usado dentro de um FavoritesProvider');
  return ctx;
}
