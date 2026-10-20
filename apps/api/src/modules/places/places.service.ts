import { CreatePlaceInput, UpdatePlaceInput, SearchPlacesQuery, PlaceDetail } from '@guia/contracts';
import { PlacesRepository } from './places.repository.js';
import { prisma } from '../../shared/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import { limpaCaches } from '../../shared/cache.js';
import { coordenadasNoBrasil } from '@guia/contracts/validadores';
import { municipioNaUf } from '../../shared/geo/municipios.js';

/**
 * Confere o que o formulário não consegue garantir sozinho: a cidade existe naquele estado
 * (lista oficial do IBGE) e o ponto no mapa está dentro do Brasil. Devolve o nome oficial da cidade.
 */
function confereLocal(cidade: string, uf: string) {
  const oficial = municipioNaUf(cidade, uf);
  if (!oficial) throw new AppError(`Não encontramos "${cidade}" em ${uf}. Escolha a cidade na lista.`, 422, 'city');
  return oficial;
}

function confereCoordenadas(lat: number, lng: number) {
  if (!coordenadasNoBrasil(lat, lng)) {
    throw new AppError('As coordenadas estão fora do Brasil. Confira latitude e longitude.', 422, 'latitude');
  }
}

type PlaceCompleto = NonNullable<Awaited<ReturnType<PlacesRepository['findById']>>>;

/**
 * Só o que a página pública mostra (PlaceDetail). O registro bruto levava junto ownerId, isActive e
 * datas internas, e a nota ia como texto (Decimal).
 */
function paraDetalhe(p: PlaceCompleto): PlaceDetail {
  const capa = p.photos.find((f) => f.isCover) ?? p.photos[0];
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    city: p.city,
    state: p.state,
    category: { id: p.category.id, name: p.category.name, slug: p.category.slug, iconName: p.category.iconName },
    coverPhotoUrl: capa?.url ?? null,
    averageRating: Number(p.averageRating),
    totalReviews: p.totalReviews,
    priceLevel: p.priceLevel,
    amenities: p.amenities,
    isVerified: p.isVerified,
    phone: p.phone,
    websiteUrl: p.websiteUrl,
    street: p.street,
    number: p.number,
    neighborhood: p.neighborhood,
    postalCode: p.postalCode,
    latitude: p.latitude,
    longitude: p.longitude,
    hours: p.hours.map((h) => ({ day: h.day, openTime: h.openTime, closeTime: h.closeTime, isClosed: h.isClosed })),
    photos: p.photos.map((f) => ({ id: f.id, url: f.url, caption: f.caption, isCover: f.isCover })),
  };
}

export class PlacesService {
  constructor(private placesRepository: PlacesRepository) {}

  async search(query: SearchPlacesQuery) {
    return this.placesRepository.search(query);
  }

  async getBySlug(slug: string): Promise<PlaceDetail> {
    const place = await this.placesRepository.findBySlug(slug);
    if (!place || !place.isActive) {
      throw new AppError('Estabelecimento não encontrado.', 404);
    }
    return paraDetalhe(place);
  }

  async getById(id: string): Promise<PlaceDetail> {
    const place = await this.placesRepository.findById(id);
    if (!place || !place.isActive) {
      throw new AppError('Estabelecimento não encontrado.', 404);
    }
    return paraDetalhe(place);
  }

  async create(data: CreatePlaceInput, ownerId: string) {
    // 1. Verifica se a categoria é válida
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!categoryExists) {
      throw new AppError('Categoria informada não existe.', 404);
    }

    // 2. Confere cidade/estado e coordenadas, e gera um slug único e amigável para SEO
    const cidade = confereLocal(data.city, data.state);
    confereCoordenadas(data.latitude, data.longitude);

    const baseSlug = `${data.name}-${cidade}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    let slug = baseSlug;
    let counter = 1;
    while (await prisma.place.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 3. Salva no banco com isolamento seguro (Anti-Mass Assignment)
    const criado = await prisma.place.create({
      data: {
        ownerId,
        categoryId: data.categoryId,
        name: data.name,
        slug,
        description: data.description,
        phone: data.phone ?? null,
        websiteUrl: data.websiteUrl ?? null,
        priceLevel: data.priceLevel ?? null,
        amenities: data.amenities ?? [],
        street: data.street,
        number: data.number,
        neighborhood: data.neighborhood,
        city: cidade,
        state: data.state,
        postalCode: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
        ...(data.coverPhotoUrl && {
          photos: {
            create: {
              url: data.coverPhotoUrl,
              isCover: true,
              caption: data.name,
            },
          },
        }),
        ...(data.hours && {
          hours: {
            createMany: {
              data: data.hours.map((h) => ({
                day: h.day,
                openTime: h.openTime,
                closeTime: h.closeTime,
                isClosed: h.isClosed,
              })),
            },
          },
        }),
      },
      include: {
        category: true,
        hours: true,
        photos: true,
      },
    });
    limpaCaches();
    return criado;
  }

  async findByOwnerId(ownerId: string) {
    return this.placesRepository.findByOwnerId(ownerId);
  }

  async update(id: string, data: UpdatePlaceInput) {
    // cidade e estado só fazem sentido juntos: completa o que faltar com o que já está salvo
    let cidade = data.city;
    if (data.city !== undefined || data.state !== undefined || data.latitude !== undefined || data.longitude !== undefined) {
      const atual = await prisma.place.findUnique({
        where: { id },
        select: { city: true, state: true, latitude: true, longitude: true },
      });
      if (!atual) throw new AppError('Estabelecimento não encontrado.', 404);

      if (data.city !== undefined || data.state !== undefined) {
        cidade = confereLocal(data.city ?? atual.city, data.state ?? atual.state);
      }
      if (data.latitude !== undefined || data.longitude !== undefined) {
        confereCoordenadas(data.latitude ?? atual.latitude, data.longitude ?? atual.longitude);
      }
    }

    const atualizado = await prisma.place.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.websiteUrl !== undefined && { websiteUrl: data.websiteUrl }),
        ...(data.priceLevel !== undefined && { priceLevel: data.priceLevel }),
        ...(data.amenities !== undefined && { amenities: data.amenities }),
        ...(data.street && { street: data.street }),
        ...(data.number && { number: data.number }),
        ...(data.neighborhood && { neighborhood: data.neighborhood }),
        ...(cidade && { city: cidade }),
        ...(data.state && { state: data.state }),
        ...(data.postalCode && { postalCode: data.postalCode }),
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
      },
    });
    limpaCaches();
    return atualizado;
  }

  async delete(id: string) {
    const place = await this.placesRepository.findById(id);
    if (!place) {
      throw new AppError('Estabelecimento não encontrado.', 404);
    }
    const removido = await this.placesRepository.delete(id);
    limpaCaches();
    return removido;
  }
}
