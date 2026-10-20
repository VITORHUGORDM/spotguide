import { z } from 'zod';
import { COMODIDADE_IDS } from './comodidades.js';
import { normalizaHorario, normalizaTelefone, normalizaUrlHttp, validaCep, formataCep } from './validadores.js';
import { normalizaUf } from './brasil.js';

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

/** Hora no formato HH:mm; aceita "9:30" e "0930" e grava sempre "09:30". */
const horario = z
  .string()
  .trim()
  .transform((v, ctx) => {
    const h = normalizaHorario(v);
    if (!h) {
      ctx.addIssue({ code: 'custom', message: 'Horário inválido. Use HH:mm, por exemplo 18:30' });
      return z.NEVER;
    }
    return h;
  });

export const PlaceHourSchema = z
  .object({
    day: DayOfWeekSchema,
    openTime: horario.nullable(),
    closeTime: horario.nullable(),
    isClosed: z.boolean().default(false),
  })
  .strict()
  .superRefine((h, ctx) => {
    if (h.isClosed) return;
    if (!h.openTime || !h.closeTime) {
      ctx.addIssue({ code: 'custom', path: ['openTime'], message: 'Informe abertura e fechamento ou marque como fechado' });
    } else if (h.openTime === h.closeTime) {
      ctx.addIssue({ code: 'custom', path: ['closeTime'], message: 'Abertura e fechamento não podem ser iguais' });
    }
  });

/** Campo de telefone: vazio vira null, número inválido é recusado e o válido é gravado só com dígitos. */
const telefone = z
  .string()
  .trim()
  .transform((v, ctx) => {
    if (!v) return null;
    const n = normalizaTelefone(v);
    if (!n) {
      ctx.addIssue({ code: 'custom', message: 'Telefone inválido. Use DDD + número, por exemplo (54) 99999-0000' });
      return z.NEVER;
    }
    return n;
  })
  .optional()
  .nullable();

/** Link: vazio vira null; só http/https (sem javascript:), e "site.com.br" ganha o https://. */
const link = (mensagem: string) =>
  z
    .string()
    .trim()
    .transform((v, ctx) => {
      if (!v) return null;
      const url = normalizaUrlHttp(v);
      if (!url) {
        ctx.addIssue({ code: 'custom', message: mensagem });
        return z.NEVER;
      }
      return url;
    })
    .optional()
    .nullable();

const estado = z
  .string()
  .trim()
  .transform((v, ctx) => {
    const uf = normalizaUf(v);
    if (!uf) {
      ctx.addIssue({ code: 'custom', message: 'Estado inválido. Escolha uma das 27 unidades da federação' });
      return z.NEVER;
    }
    return uf;
  });

const cep = z
  .string()
  .trim()
  .transform((v, ctx) => {
    if (!validaCep(v)) {
      ctx.addIssue({ code: 'custom', message: 'CEP inválido. Use 8 dígitos, por exemplo 95670-000' });
      return z.NEVER;
    }
    return formataCep(v);
  });

// Schema de Criação de Estabelecimento (.strict() previne Mass Assignment de métricas)
export const CreatePlaceInputSchema = z.object({
  categoryId: z.string().uuid('ID de categoria inválido'),
  name: z.string().trim().min(2, 'Nome deve ter no mínimo 2 caracteres').max(150, 'Nome pode ter no máximo 150 caracteres'),
  description: z
    .string()
    .trim()
    .min(10, 'Descrição deve ter no mínimo 10 caracteres')
    .max(2000, 'Descrição pode ter no máximo 2000 caracteres'),
  phone: telefone,
  websiteUrl: link('Endereço do site inválido. Use um link http ou https, por exemplo https://seusite.com.br'),

  // Endereço
  street: z.string().trim().min(2, 'Informe a rua').max(150),
  number: z
    .string()
    .trim()
    .min(1, 'Informe o número (ou s/n)')
    .max(20)
    .regex(/^[\p{L}\p{N}\s/.,-]+$/u, 'Número inválido'),
  neighborhood: z.string().trim().min(2, 'Informe o bairro').max(100),
  city: z.string().trim().min(2, 'Informe a cidade').max(100),
  state: estado,
  postalCode: cep,

  // Coordenadas Geográficas (a conferência "dentro do Brasil" é feita na API)
  latitude: z.number({ invalid_type_error: 'Latitude inválida' }).min(-90).max(90),
  longitude: z.number({ invalid_type_error: 'Longitude inválida' }).min(-180).max(180),

  // Foto de Capa (URL)
  coverPhotoUrl: link('Endereço da imagem inválido. Use um link http ou https'),

  // Faixa de preço (1 a 4) e comodidades
  priceLevel: z.number().int().min(1).max(4).nullable().optional(),
  amenities: z
    .array(z.enum(COMODIDADE_IDS))
    .max(COMODIDADE_IDS.length)
    .transform((lista) => Array.from(new Set(lista)))
    .optional(),

  // Horários opcionais
  hours: z
    .array(PlaceHourSchema)
    .max(7)
    .refine((hs) => new Set(hs.map((h) => h.day)).size === hs.length, 'Há um dia da semana repetido nos horários')
    .optional(),
}).strict();

export type CreatePlaceInput = z.infer<typeof CreatePlaceInputSchema>;
/** O que o formulário envia (antes de a API normalizar telefone, CEP, links...). */
export type CreatePlaceFormInput = z.input<typeof CreatePlaceInputSchema>;

// Schema de Atualização de Estabelecimento
export const UpdatePlaceInputSchema = CreatePlaceInputSchema.partial();
export type UpdatePlaceInput = z.infer<typeof UpdatePlaceInputSchema>;
export type UpdatePlaceFormInput = z.input<typeof UpdatePlaceInputSchema>;

// Filtros de Busca e Geolocalização
// Querystring só traz texto: "false" não pode virar true (z.coerce.boolean faria isso)
const flag = z
  .enum(['true', 'false', '1', '0'])
  .transform((v) => v === 'true' || v === '1')
  .optional();

export const PLACE_SORTS = ['rating', 'reviews', 'recent', 'name', 'distance'] as const;
export type PlaceSort = (typeof PLACE_SORTS)[number];

export const SearchPlacesQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().min(0.5).max(100).default(10),
  city: z.string().trim().max(100).optional(),
  // sigla (SP) ou nome (São Paulo); o repositório normaliza
  state: z.string().trim().max(50).optional(),
  categorySlug: z.string().trim().max(60).optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  search: z.string().trim().max(100).optional(),
  sort: z.enum(PLACE_SORTS).optional(),
  openNow: flag,
  hasPhoto: flag,
  verified: flag,
  // faixa de preço máxima (1 a 4) e comodidades separadas por vírgula (o local precisa ter todas)
  maxPrice: z.coerce.number().int().min(1).max(4).optional(),
  amenities: z.string().trim().max(300).optional(),
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
  priceLevel: z.number().nullable().optional(),
  amenities: z.array(z.string()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  distanceKm: z.number().optional(),
});

export type PlaceListItem = z.infer<typeof PlaceListItemSchema>;

// DTO Completo de Detalhes
export const PlaceDetailSchema = PlaceListItemSchema.extend({
  isVerified: z.boolean().optional(),
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
