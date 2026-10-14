import { CreatePlaceInput, UpdatePlaceInput, SearchPlacesQuery } from '@guia/contracts';
import { PlacesRepository } from './places.repository.js';
import { prisma } from '../../shared/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';

export class PlacesService {
  constructor(private placesRepository: PlacesRepository) {}

  async search(query: SearchPlacesQuery) {
    return this.placesRepository.search(query);
  }

  async getBySlug(slug: string) {
    const place = await this.placesRepository.findBySlug(slug);
    if (!place || !place.isActive) {
      throw new AppError('Estabelecimento não encontrado.', 404);
    }
    return place;
  }

  async getById(id: string) {
    const place = await this.placesRepository.findById(id);
    if (!place || !place.isActive) {
      throw new AppError('Estabelecimento não encontrado.', 404);
    }
    return place;
  }

  async create(data: CreatePlaceInput, ownerId: string) {
    // 1. Verifica se a categoria é válida
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!categoryExists) {
      throw new AppError('Categoria informada não existe.', 404);
    }

    // 2. Gera slug único e amigável para SEO
    const baseSlug = `${data.name}-${data.city}`
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
    return prisma.place.create({
      data: {
        ownerId,
        categoryId: data.categoryId,
        name: data.name,
        slug,
        description: data.description,
        phone: data.phone,
        websiteUrl: data.websiteUrl,
        street: data.street,
        number: data.number,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
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
      },
    });
  }

  async update(id: string, data: UpdatePlaceInput) {
    return prisma.place.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.websiteUrl !== undefined && { websiteUrl: data.websiteUrl }),
        ...(data.street && { street: data.street }),
        ...(data.number && { number: data.number }),
        ...(data.neighborhood && { neighborhood: data.neighborhood }),
        ...(data.city && { city: data.city }),
        ...(data.state && { state: data.state }),
        ...(data.postalCode && { postalCode: data.postalCode }),
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
      },
    });
  }
}
