import {
  PlaceListItem,
  PlaceDetail,
  CategoryResponse,
  CreatePlaceFormInput,
  UpdatePlaceFormInput,
  CreateReviewInput,
  ReplyReviewInput,
  ReviewResponse,
  RegisterFormInput,
  LoginInput,
  AuthResponse,
} from '@guia/contracts';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api/v1';

/** Erro da API com a mensagem em português e, quando houver, qual campo do formulário falhou. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    /** nome do campo -> mensagem */
    public readonly campos: Record<string, string> = {}
  ) {
    super(message);
  }
}

async function leErro(res: Response, padrao: string): Promise<ApiError> {
  const corpo = await res.json().catch(() => ({}));
  const campos: Record<string, string> = {};
  for (const i of (corpo.issues ?? []) as { path: string; message: string }[]) {
    // path vem como "hours.0.openTime"; o primeiro erro de cada campo basta
    if (!(i.path in campos)) campos[i.path] = i.message;
  }
  return new ApiError(corpo.message || corpo.error || padrao, res.status, campos);
}

export interface EnderecoCep {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface GuiaStats {
  lugares: number;
  cidades: number;
  estados: number;
  avaliacoes: number;
  nota: number;
}

export interface SearchParams {
  city?: string;
  state?: string;
  /** um slug ou vários separados por vírgula */
  categorySlug?: string;
  search?: string;
  minRating?: number;
  sort?: 'rating' | 'reviews' | 'recent' | 'name' | 'distance';
  openNow?: boolean;
  hasPhoto?: boolean;
  verified?: boolean;
  /** faixa de preço máxima, de 1 ($) a 4 ($$$$) */
  maxPrice?: number;
  /** ids separados por vírgula; o local precisa ter todos */
  amenities?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  page?: number;
  limit?: number;
}

function montaQuery(p: SearchParams) {
  const q = new URLSearchParams();
  for (const [chave, valor] of Object.entries(p)) {
    if (valor === undefined || valor === '' || valor === false) continue;
    q.set(chave, String(valor));
  }
  return q.toString();
}

/**
 * No servidor: com `revalidate` a página fica em cache e se renova sozinha; sem ele, sempre busca.
 * No navegador o cache HTTP já cuida (a API manda Cache-Control curto).
 */
function cacheInit(revalidate?: number): RequestInit {
  if (revalidate !== undefined) return { next: { revalidate } } as RequestInit;
  return typeof window === 'undefined' ? { cache: 'no-store' } : {};
}

export class ApiClient {
  static async getCategories(): Promise<CategoryResponse[]> {
    const res = await fetch(`${API_BASE_URL}/categories`, cacheInit(3600));
    if (!res.ok) throw new Error('Falha ao buscar categorias');
    return res.json();
  }

  static async getCities(
    q?: string,
    opts: { uf?: string; limit?: number; signal?: AbortSignal } = {}
  ): Promise<{ city: string; state: string; count: number }[]> {
    const query = new URLSearchParams();
    if (q) query.set('q', q);
    if (opts.uf) query.set('uf', opts.uf);
    if (opts.limit) query.set('limit', String(opts.limit));
    try {
      const res = await fetch(`${API_BASE_URL}/places/cities?${query}`, { signal: opts.signal, ...cacheInit(60) });
      return res.ok ? res.json() : [];
    } catch (err) {
      if (opts.signal?.aborted) throw err;
      return [];
    }
  }

  /** Endereço do CEP, ou null se não existir. Outros erros (serviço fora do ar) viram ApiError. */
  static async buscaCep(cep: string, signal?: AbortSignal): Promise<EnderecoCep | null> {
    const res = await fetch(`${API_BASE_URL}/lookup/cep/${encodeURIComponent(cep)}`, { signal });
    if (res.status === 404) return null;
    if (!res.ok) throw await leErro(res, 'Não conseguimos consultar o CEP agora');
    return res.json();
  }

  /** Estados que já têm lugares, com a contagem. */
  static async getStates(): Promise<{ uf: string; count: number }[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/places/states`, cacheInit(60));
      return res.ok ? res.json() : [];
    } catch {
      return [];
    }
  }

  /** Números da home; vem pronto da API em vez de somar a lista de lugares no navegador. */
  static async getStats(): Promise<GuiaStats | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/places/stats`, cacheInit(60));
      return res.ok ? res.json() : null;
    } catch {
      return null;
    }
  }

  /** Uma página de resultados e o total (cabeçalho X-Total-Count). */
  static async searchPlacesPage(
    params: SearchParams,
    opts: { signal?: AbortSignal; revalidate?: number } = {}
  ): Promise<{ items: PlaceListItem[]; total: number }> {
    const res = await fetch(`${API_BASE_URL}/places?${montaQuery(params)}`, {
      signal: opts.signal,
      ...cacheInit(opts.revalidate),
    });
    if (!res.ok) throw new Error('Falha ao buscar estabelecimentos');
    const items: PlaceListItem[] = await res.json();
    return { items, total: Number(res.headers.get('X-Total-Count') ?? items.length) };
  }

  static async searchPlaces(params: SearchParams, opts: { revalidate?: number } = {}): Promise<PlaceListItem[]> {
    return (await this.searchPlacesPage(params, opts)).items;
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
    if (!res.ok) throw await leErro(res, 'Erro ao enviar avaliação');
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
    if (!res.ok) throw await leErro(res, 'Erro ao responder avaliação');
    return res.json();
  }

  // Auth
  static async login(data: LoginInput): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await leErro(res, 'Erro ao realizar login');
    return res.json();
  }

  static async register(data: RegisterFormInput): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await leErro(res, 'Erro ao realizar cadastro');
    return res.json();
  }

  /** Troca o refresh token por um par novo. 401 quer dizer sessão encerrada de vez. */
  static async refresh(refreshToken: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) throw await leErro(res, 'Sessão expirada');
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

  static async createPlace(data: CreatePlaceFormInput, token: string): Promise<PlaceDetail> {
    const res = await fetch(`${API_BASE_URL}/places`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await leErro(res, 'Erro ao cadastrar estabelecimento');
    return res.json();
  }

  static async updatePlace(
    id: string,
    data: UpdatePlaceFormInput,
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
    if (!res.ok) throw await leErro(res, 'Erro ao atualizar estabelecimento');
    return res.json();
  }

  static async uploadPhoto(
    placeId: string,
    arquivo: File,
    token: string
  ): Promise<{ id: string; url: string; caption: string | null; isCover: boolean }> {
    const form = new FormData();
    form.append('file', arquivo);
    const res = await fetch(`${API_BASE_URL}/places/${placeId}/photos`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }, // sem Content-Type: o navegador define o boundary
      body: form,
    });
    if (!res.ok) throw await leErro(res, 'Erro ao enviar a foto');
    return res.json();
  }

  static async deletePhoto(placeId: string, photoId: string, token: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/places/${placeId}/photos/${photoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Erro ao remover a foto');
  }

  static async setCoverPhoto(placeId: string, photoId: string, token: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/places/${placeId}/photos/${photoId}/cover`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Erro ao trocar a capa');
  }

  static async deletePlace(id: string, token: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/places/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Erro ao excluir estabelecimento');
  }
}
