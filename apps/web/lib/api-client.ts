import { PlaceListItem, PlaceDetail, CategoryResponse } from '@guia/contracts';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1';

export class ApiClient {
  static async getCategories(): Promise<CategoryResponse[]> {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      next: { revalidate: 3600 }, // Cache ISR por 1 hora
    });
    if (!res.ok) throw new Error('Falha ao buscar categorias');
    return res.json();
  }

  static async searchPlaces(params: {
    city?: string;
    categorySlug?: string;
    search?: string;
    lat?: number;
    lng?: number;
  }): Promise<PlaceListItem[]> {
    const query = new URLSearchParams();
    if (params.city) query.set('city', params.city);
    if (params.categorySlug) query.set('categorySlug', params.categorySlug);
    if (params.search) query.set('search', params.search);
    if (params.lat) query.set('lat', String(params.lat));
    if (params.lng) query.set('lng', String(params.lng));

    const res = await fetch(`${API_BASE_URL}/places?${query.toString()}`, {
      cache: 'no-store', // Busca dinâmica
    });
    if (!res.ok) throw new Error('Falha ao buscar estabelecimentos');
    return res.json();
  }

  static async getPlaceBySlug(slug: string): Promise<PlaceDetail> {
    const res = await fetch(`${API_BASE_URL}/places/slug/${slug}`, {
      next: { revalidate: 60 }, // Revalidação a cada minuto (SEO & Frescor de dados)
    });
    if (!res.ok) throw new Error('Estabelecimento não encontrado');
    return res.json();
  }
}
