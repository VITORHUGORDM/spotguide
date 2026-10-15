import {
  PlaceListItem,
  PlaceDetail,
  CategoryResponse,
  CreatePlaceInput,
  UpdatePlaceInput,
  CreateReviewInput,
  ReplyReviewInput,
  ReviewResponse,
  RegisterInput,
  LoginInput,
  AuthResponse,
} from '@guia/contracts';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api/v1';

export class ApiClient {
  static async getCategories(): Promise<CategoryResponse[]> {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('Falha ao buscar categorias');
    return res.json();
  }

  static async getCities(q?: string): Promise<{ city: string; state: string; count: number }[]> {
    const query = q ? `?q=${encodeURIComponent(q)}` : '';
    const res = await fetch(`${API_BASE_URL}/places/cities${query}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  }

  static async searchPlaces(params: {
    city?: string;
    categorySlug?: string;
    search?: string;
    minRating?: number;
    lat?: number;
    lng?: number;
    radiusKm?: number;
  }): Promise<PlaceListItem[]> {
    const query = new URLSearchParams();
    if (params.city) query.set('city', params.city);
    if (params.categorySlug) query.set('categorySlug', params.categorySlug);
    if (params.search) query.set('search', params.search);
    if (params.minRating) query.set('minRating', String(params.minRating));
    if (params.lat) query.set('lat', String(params.lat));
    if (params.lng) query.set('lng', String(params.lng));
    if (params.radiusKm) query.set('radiusKm', String(params.radiusKm));

    const res = await fetch(`${API_BASE_URL}/places?${query.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Falha ao buscar estabelecimentos');
    return res.json();
  }

  static async getPlaceBySlug(slug: string): Promise<PlaceDetail> {
    const res = await fetch(`${API_BASE_URL}/places/slug/${slug}`, {
      next: { revalidate: 10 },
    });
    if (!res.ok) throw new Error('Estabelecimento não encontrado');
    return res.json();
  }

  static async getPlaceById(id: string): Promise<PlaceDetail> {
    const res = await fetch(`${API_BASE_URL}/places/id/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Estabelecimento não encontrado');
    return res.json();
  }

  static async getPlaceReviews(placeId: string): Promise<ReviewResponse[]> {
    const res = await fetch(`${API_BASE_URL}/reviews/place/${placeId}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Falha ao buscar avaliações');
    return res.json();
  }

  static async createReview(
    placeId: string,
    data: CreateReviewInput,
    token: string
  ): Promise<ReviewResponse> {
    const res = await fetch(`${API_BASE_URL}/reviews/place/${placeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Erro ao enviar avaliação');
    }
    return res.json();
  }

  static async replyReview(
    reviewId: string,
    data: ReplyReviewInput,
    token: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Erro ao responder avaliação');
    }
    return res.json();
  }

  // Auth
  static async login(data: LoginInput): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Erro ao realizar login');
    }
    return res.json();
  }

  static async register(data: RegisterInput): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Erro ao realizar cadastro');
    }
    return res.json();
  }

  static async getMe(token: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Sessão expirada ou inválida');
    return res.json();
  }

  // Merchant Endpoints
  static async getMyPlaces(token: string): Promise<PlaceListItem[]> {
    const res = await fetch(`${API_BASE_URL}/places/merchant/my-places`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Falha ao carregar seus estabelecimentos');
    return res.json();
  }

  static async createPlace(data: CreatePlaceInput, token: string): Promise<PlaceDetail> {
    const res = await fetch(`${API_BASE_URL}/places`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Erro ao cadastrar estabelecimento');
    }
    return res.json();
  }

  static async updatePlace(
    id: string,
    data: UpdatePlaceInput,
    token: string
  ): Promise<PlaceDetail> {
    const res = await fetch(`${API_BASE_URL}/places/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Erro ao atualizar estabelecimento');
    }
    return res.json();
  }

  static async deletePlace(id: string, token: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/places/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Erro ao excluir estabelecimento');
  }
}
