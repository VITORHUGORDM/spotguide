import { z } from 'zod';

export const DayOfWeekSchema = z.enum([
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
]);
export type DayOfWeek = z.infer<typeof DayOfWeekSchema>;

export const PlaceHourSchema = z.object({
  day: DayOfWeekSchema,
  openTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Formato HH:mm').nullable(),
  closeTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Formato HH:mm').nullable(),
  isClosed: z.boolean().default(false),
}).strict();

// Schema de Criação de Estabelecimento (.strict() previne Mass Assignment de métricas)
export const CreatePlaceInputSchema = z.object({
  categoryId: z.string().uuid('ID de categoria inválido'),
  name: z.string().trim().min(2, 'Nome deve ter no mínimo 2 caracteres').max(150),
  description: z.string().trim().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  phone: z.string().trim().max(20).optional().nullable(),
  websiteUrl: z.union([z.string().trim().url('URL de website inválida'), z.literal('')]).optional().nullable(),
  
  // Endereço
  street: z.string().trim().min(2).max(150),
  number: z.string().trim().max(20),
  neighborhood: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(50),
  postalCode: z.string().trim().max(20),
  
  // Coordenadas Geográficas
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),

  // Foto de Capa (URL)
  coverPhotoUrl: z.union([z.string().trim().url('URL da imagem inválida'), z.literal('')]).optional().nullable(),
  
  // Horários opcionais
  hours: z.array(PlaceHourSchema).optional(),
}).strict();

export type CreatePlaceInput = z.infer<typeof CreatePlaceInputSchema>;

// Schema de Atualização de Estabelecimento
export const UpdatePlaceInputSchema = CreatePlaceInputSchema.partial();
export type UpdatePlaceInput = z.infer<typeof UpdatePlaceInputSchema>;

// Filtros de Busca e Geolocalização
export const SearchPlacesQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().min(0.5).max(100).default(10),
  city: z.string().optional(),
  categorySlug: z.string().optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type SearchPlacesQuery = z.infer<typeof SearchPlacesQuerySchema>;

// DTO de Retorno na Listagem (Leve e Seguro)
export const PlaceListItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  city: z.string(),
  state: z.string(),
  category: z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    iconName: z.string(),
  }),
  coverPhotoUrl: z.string().nullable(),
  averageRating: z.number(),
  totalReviews: z.number(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  distanceKm: z.number().optional(),
});

export type PlaceListItem = z.infer<typeof PlaceListItemSchema>;

// DTO Completo de Detalhes
export const PlaceDetailSchema = PlaceListItemSchema.extend({
  phone: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  street: z.string(),
  number: z.string(),
  neighborhood: z.string(),
  postalCode: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  hours: z.array(PlaceHourSchema),
  photos: z.array(
    z.object({
      id: z.string().uuid(),
      url: z.string(),
      caption: z.string().nullable(),
      isCover: z.boolean(),
    })
  ),
});

export type PlaceDetail = z.infer<typeof PlaceDetailSchema>;
