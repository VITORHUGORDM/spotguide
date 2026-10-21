import { Prisma } from '@prisma/client';
import { PlaceListItem } from '@guia/contracts';

/** O que buscar de um Place para montar um PlaceListItem (categoria e a foto de capa). */
export const placeListInclude = {
  category: true,
  photos: { orderBy: [{ isCover: 'desc' }, { displayOrder: 'asc' }], take: 1 },
} satisfies Prisma.PlaceInclude;

export type PlaceWithList = Prisma.PlaceGetPayload<{ include: typeof placeListInclude }>;

export function toPlaceListItem(p: PlaceWithList): PlaceListItem {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    city: p.city,
    state: p.state,
    category: { id: p.category.id, name: p.category.name, slug: p.category.slug, iconName: p.category.iconName },
    coverPhotoUrl: p.photos[0]?.url ?? null,
    averageRating: Number(p.averageRating),
    totalReviews: p.totalReviews,
    priceLevel: p.priceLevel,
    amenities: p.amenities,
    latitude: p.latitude,
    longitude: p.longitude,
  };
}
