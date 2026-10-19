import { prisma } from '../../shared/database/prisma.js';
import { SearchPlacesQuery } from '@guia/contracts';
import { Prisma } from '@prisma/client';

export class PlacesRepository {
  async search(query: SearchPlacesQuery) {
    const { lat, lng, radiusKm, city, categorySlug, minRating, search, page, limit } = query;
    const offset = (page - 1) * limit;

    // Se houver coordenadas GPS, calculamos a distância geográfica com Haversine via SQL parametrizado
    if (lat !== undefined && lng !== undefined) {
      const places = await prisma.$queryRaw<any[]>`
        SELECT 
          p.id, 
          p.name, 
          p.slug, 
          p.description, 
          p.city, 
          p.state,
          p.average_rating as "averageRating", 
          p.total_reviews as "totalReviews",
          p.latitude, 
          p.longitude,
          c.id as "categoryId",
          c.name as "categoryName",
          c.slug as "categorySlug",
          c.icon_name as "categoryIcon",
          (
            6371 * acos(LEAST(1.0, GREATEST(-1.0,
              cos(radians(${lat})) * cos(radians(p.latitude)) *
              cos(radians(p.longitude) - radians(${lng})) +
              sin(radians(${lat})) * sin(radians(p.latitude))
            )))
          ) AS "distanceKm",
          (
            SELECT url FROM place_photos 
            WHERE place_id = p.id AND is_cover = TRUE 
            LIMIT 1
          ) AS "coverPhotoUrl"
        FROM places p
        JOIN categories c ON c.id = p.category_id
        WHERE p.is_active = TRUE
          ${city ? Prisma.sql`AND LOWER(p.city) = LOWER(${city})` : Prisma.empty}
          ${categorySlug ? Prisma.sql`AND c.slug = ${categorySlug}` : Prisma.empty}
          ${minRating ? Prisma.sql`AND p.average_rating >= ${minRating}` : Prisma.empty}
          ${search ? Prisma.sql`AND (LOWER(p.name) LIKE LOWER(${'%' + search + '%'}) OR LOWER(p.description) LIKE LOWER(${'%' + search + '%'}))` : Prisma.empty}
          AND (
            6371 * acos(LEAST(1.0, GREATEST(-1.0,
              cos(radians(${lat})) * cos(radians(p.latitude)) *
              cos(radians(p.longitude) - radians(${lng})) +
              sin(radians(${lat})) * sin(radians(p.latitude))
            )))
          ) <= ${radiusKm}
        ORDER BY "distanceKm" ASC
        LIMIT ${limit} OFFSET ${offset};
      `;

      return places.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        city: p.city,
        state: p.state,
        category: {
          id: p.categoryId,
          name: p.categoryName,
          slug: p.categorySlug,
          iconName: p.categoryIcon,
        },
        coverPhotoUrl: p.coverPhotoUrl ?? null,
        averageRating: Number(p.averageRating),
        totalReviews: Number(p.totalReviews),
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
        distanceKm: Number(Number(p.distanceKm).toFixed(1)),
      }));
    }

    // Busca padrão sem GPS (por Cidade, Categoria ou Busca Textual)
    const where: Prisma.PlaceWhereInput = {
      isActive: true,
      ...(city && { city: { equals: city, mode: 'insensitive' } }),
      ...(categorySlug && { category: { slug: categorySlug } }),
      ...(minRating && { averageRating: { gte: minRating } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const places = await prisma.place.findMany({
      where,
      include: {
        category: true,
        photos: {
          where: { isCover: true },
          take: 1,
        },
      },
      orderBy: { averageRating: 'desc' },
      skip: offset,
      take: limit,
    });

    return places.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      city: p.city,
      state: p.state,
      category: {
        id: p.category.id,
        name: p.category.name,
        slug: p.category.slug,
        iconName: p.category.iconName,
      },
      coverPhotoUrl: p.photos[0]?.url ?? null,
      averageRating: Number(p.averageRating),
      totalReviews: p.totalReviews,
      latitude: p.latitude,
      longitude: p.longitude,
    }));
  }

  async findBySlug(slug: string) {
    return prisma.place.findUnique({
      where: { slug },
      include: {
        category: true,
        hours: true,
        photos: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.place.findUnique({
      where: { id },
      include: {
        category: true,
        hours: true,
        photos: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  async findByOwnerId(ownerId: string) {
    const places = await prisma.place.findMany({
      where: { ownerId },
      include: {
        category: true,
        photos: {
          where: { isCover: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return places.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      city: p.city,
      state: p.state,
      isActive: p.isActive,
      category: {
        id: p.category.id,
        name: p.category.name,
        slug: p.category.slug,
        iconName: p.category.iconName,
      },
      coverPhotoUrl: p.photos[0]?.url ?? null,
      averageRating: Number(p.averageRating),
      totalReviews: p.totalReviews,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  }

  async delete(id: string) {
    return prisma.place.delete({
      where: { id },
    });
  }

  async getCities(search?: string) {
    const dbCities = await prisma.place.groupBy({
      by: ['city', 'state'],
      where: {
        isActive: true,
        ...(search
          ? {
              OR: [
                { city: { contains: search, mode: 'insensitive' } },
                { state: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    const popularCities = [
      { city: 'Gramado', state: 'RS' },
      { city: 'Campos do Jordão', state: 'SP' },
      { city: 'Florianópolis', state: 'SC' },
      { city: 'Rio de Janeiro', state: 'RJ' },
      { city: 'São Paulo', state: 'SP' },
      { city: 'Curitiba', state: 'PR' },
      { city: 'Balneário Camboriú', state: 'SC' },
      { city: 'Porto Alegre', state: 'RS' },
      { city: 'Salvador', state: 'BA' },
      { city: 'Belo Horizonte', state: 'MG' },
      { city: 'Bonito', state: 'MS' },
      { city: 'Paraty', state: 'RJ' },
      { city: 'Monte Verde', state: 'MG' },
      { city: 'Foz do Iguaçu', state: 'PR' },
      { city: 'Jericoacoara', state: 'CE' },
      { city: 'Maragogi', state: 'AL' },
    ];

    const cityMap = new Map<string, { city: string; state: string; count: number }>();

    for (const item of dbCities) {
      cityMap.set(`${item.city.toLowerCase()}-${item.state.toLowerCase()}`, {
        city: item.city,
        state: item.state,
        count: item._count.id,
      });
    }

    const filteredPopular = search
      ? popularCities.filter(
          (c) =>
            c.city.toLowerCase().includes(search.toLowerCase()) ||
            c.state.toLowerCase().includes(search.toLowerCase())
        )
      : popularCities;

    for (const item of filteredPopular) {
      const key = `${item.city.toLowerCase()}-${item.state.toLowerCase()}`;
      if (!cityMap.has(key)) {
        cityMap.set(key, {
          city: item.city,
          state: item.state,
          count: 0,
        });
      }
    }

    return Array.from(cityMap.values()).slice(0, 10);
  }
}
