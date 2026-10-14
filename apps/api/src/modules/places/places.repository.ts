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
            6371 * acos(
              cos(radians(${lat})) * cos(radians(p.latitude)) *
              cos(radians(p.longitude) - radians(${lng})) +
              sin(radians(${lat})) * sin(radians(p.latitude))
            )
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
            6371 * acos(
              cos(radians(${lat})) * cos(radians(p.latitude)) *
              cos(radians(p.longitude) - radians(${lng})) +
              sin(radians(${lat})) * sin(radians(p.latitude))
            )
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
}
