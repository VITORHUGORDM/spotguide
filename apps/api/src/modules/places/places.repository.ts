import { prisma } from '../../shared/database/prisma.js';
import { PlaceListItem, SearchPlacesQuery } from '@guia/contracts';
import { COMODIDADE_IDS } from '@guia/contracts/comodidades';
import { normalizaUf } from '@guia/contracts/brasil';
import { Prisma } from '@prisma/client';
import { nomeOficial } from '../../shared/geo/municipios.js';

const DIAS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;

/** Dia da semana e hora ("1830") em Brasília, que é como os comerciantes cadastram o horário. */
function agoraNoBrasil() {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const pega = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '';
  const dia = pega('weekday').toUpperCase() as (typeof DIAS)[number];
  const ontem = DIAS[(DIAS.indexOf(dia) + 6) % 7];
  return { dia, ontem, hhmm: `${pega('hour')}${pega('minute')}` };
}

/**
 * Aberto agora: dentro do horário de hoje, ou ainda na madrugada de um horário de ontem que vira a meia-noite
 * (sexta 18:00-02:00 está aberto no sábado à 01:00). Fechamento menor ou igual à abertura = vira a meia-noite.
 */
export function filtroAbertoAgora({ dia, ontem, hhmm }: { dia: string; ontem: string; hhmm: string }) {
  return Prisma.sql`EXISTS (
    SELECT 1 FROM place_hours h
    WHERE h.place_id = p.id AND h.is_closed = FALSE
      AND h.open_time IS NOT NULL AND h.close_time IS NOT NULL
      AND (
        (h.day = ${dia}::"DayOfWeek"
          AND REPLACE(h.open_time, ':', '') <= ${hhmm}
          AND (REPLACE(h.close_time, ':', '') > ${hhmm} OR REPLACE(h.close_time, ':', '') <= REPLACE(h.open_time, ':', '')))
        OR
        (h.day = ${ontem}::"DayOfWeek"
          AND REPLACE(h.close_time, ':', '') <= REPLACE(h.open_time, ':', '')
          AND REPLACE(h.close_time, ':', '') > ${hhmm})
      )
  )`;
}

export class PlacesRepository {
  /** Devolve a página pedida e o total de resultados (para "carregar mais"). */
  async search(query: SearchPlacesQuery): Promise<{ items: PlaceListItem[]; total: number }> {
    const { lat, lng, radiusKm, city, state, categorySlug, minRating, search, page, limit } = query;
    const offset = (page - 1) * limit;
    const geo = lat !== undefined && lng !== undefined;
    const sort = query.sort === 'distance' && !geo ? 'rating' : (query.sort ?? (geo ? 'distance' : 'rating'));

    const uf = state ? normalizaUf(state) : undefined;
    const categorias = categorySlug?.split(',').map((c) => c.trim()).filter(Boolean) ?? [];
    // só ids que existem: o resto é ignorado em vez de virar consulta
    const comodidades = (query.amenities?.split(',') ?? []).map((c) => c.trim()).filter((c) => (COMODIDADE_IDS as string[]).includes(c));

    // distância exata só para quem passou no retângulo (que usa o índice de coordenadas)
    const distancia = geo
      ? Prisma.sql`(6371 * acos(LEAST(1.0, GREATEST(-1.0,
          cos(radians(${lat})) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(p.latitude))))))`
      : Prisma.sql`NULL::float8`;

    const filtros: Prisma.Sql[] = [Prisma.sql`p.is_active = TRUE`];
    if (geo) {
      const dLat = radiusKm / 111.32;
      const dLng = radiusKm / (111.32 * Math.max(Math.cos((lat * Math.PI) / 180), 0.01));
      filtros.push(
        Prisma.sql`p.latitude BETWEEN ${lat - dLat} AND ${lat + dLat} AND p.longitude BETWEEN ${lng - dLng} AND ${lng + dLng}`
      );
    }
    if (city) filtros.push(Prisma.sql`LOWER(p.city) = LOWER(${nomeOficial(city, uf)})`);
    if (uf) filtros.push(Prisma.sql`UPPER(p.state) = ${uf}`);
    else if (state) filtros.push(Prisma.sql`LOWER(p.state) = LOWER(${state})`);
    if (categorias.length) filtros.push(Prisma.sql`c.slug IN (${Prisma.join(categorias)})`);
    if (minRating) filtros.push(Prisma.sql`p.average_rating >= ${minRating}`);
    // sem faixa de preço cadastrada não dá para saber se cabe no bolso: fica de fora quando o filtro está ligado
    if (query.maxPrice) filtros.push(Prisma.sql`p.price_level IS NOT NULL AND p.price_level <= ${query.maxPrice}`);
    if (comodidades.length) filtros.push(Prisma.sql`p.amenities @> ${comodidades}::text[]`);
    if (query.verified) filtros.push(Prisma.sql`p.is_verified = TRUE`);
    if (query.hasPhoto) filtros.push(Prisma.sql`ph.url IS NOT NULL`);
    if (search) {
      const termo = `%${search.replace(/[\\%_]/g, '\\$&')}%`;
      filtros.push(
        Prisma.sql`(p.name ILIKE ${termo} OR p.description ILIKE ${termo} OR p.neighborhood ILIKE ${termo})`
      );
    }
    if (query.openNow) filtros.push(filtroAbertoAgora(agoraNoBrasil()));

    const ordem: Record<string, Prisma.Sql> = {
      rating: Prisma.sql`t."averageRating" DESC, t."totalReviews" DESC, t.name ASC`,
      reviews: Prisma.sql`t."totalReviews" DESC, t."averageRating" DESC, t.name ASC`,
      recent: Prisma.sql`t."createdAt" DESC`,
      name: Prisma.sql`t.name ASC`,
      distance: Prisma.sql`t."distanceKm" ASC, t.name ASC`,
    };

    const linhas = await prisma.$queryRaw<any[]>`
      SELECT t.*, COUNT(*) OVER()::int AS total
      FROM (
        SELECT p.id, p.name, p.slug, p.description, p.city, p.state,
               p.average_rating AS "averageRating", p.total_reviews AS "totalReviews",
               p.price_level AS "priceLevel", p.amenities,
               p.latitude, p.longitude, p.created_at AS "createdAt",
               c.id AS "categoryId", c.name AS "categoryName", c.slug AS "categorySlug", c.icon_name AS "categoryIcon",
               ph.url AS "coverPhotoUrl",
               ${distancia} AS "distanceKm"
        FROM places p
        JOIN categories c ON c.id = p.category_id
        LEFT JOIN LATERAL (
          SELECT url FROM place_photos WHERE place_id = p.id ORDER BY is_cover DESC, display_order ASC LIMIT 1
        ) ph ON TRUE
        WHERE ${Prisma.join(filtros, ' AND ')}
      ) t
      ${geo ? Prisma.sql`WHERE t."distanceKm" <= ${radiusKm}` : Prisma.empty}
      ORDER BY ${ordem[sort]}, t.id
      LIMIT ${limit} OFFSET ${offset}
    `;

    const items = linhas.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      city: p.city,
      state: p.state,
      category: { id: p.categoryId, name: p.categoryName, slug: p.categorySlug, iconName: p.categoryIcon },
      coverPhotoUrl: p.coverPhotoUrl ?? null,
      averageRating: Number(p.averageRating),
      totalReviews: Number(p.totalReviews),
      priceLevel: p.priceLevel === null ? null : Number(p.priceLevel),
      amenities: p.amenities ?? [],
      latitude: Number(p.latitude),
      longitude: Number(p.longitude),
      ...(geo && { distanceKm: Number(Number(p.distanceKm).toFixed(1)) }),
    }));
    return { items, total: linhas[0]?.total ?? (page > 1 ? offset : 0) };
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
}
