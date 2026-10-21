import { z } from 'zod';

export const ITINERARY_MAX_STOPS = 30;
export const ITINERARY_MAX_PER_USER = 20;

export const ItineraryParamsSchema = z.object({ id: z.string().uuid('Identificador inválido') }).strict();

export const CreateItineraryInputSchema = z
  .object({ title: z.string().trim().min(2, 'Dê um nome ao roteiro').max(100, 'Nome com no máximo 100 caracteres') })
  .strict();
export type CreateItineraryInput = z.infer<typeof CreateItineraryInputSchema>;

// placeIds é a lista inteira, na ordem das paradas; mandar a lista substitui a anterior
export const UpdateItineraryInputSchema = z
  .object({
    title: CreateItineraryInputSchema.shape.title.optional(),
    isPublic: z.boolean().optional(),
    placeIds: z
      .array(z.string().uuid())
      .max(ITINERARY_MAX_STOPS, `Um roteiro tem no máximo ${ITINERARY_MAX_STOPS} paradas`)
      .refine((ids) => new Set(ids).size === ids.length, 'Local repetido no roteiro')
      .optional(),
  })
  .strict()
  .refine((d) => Object.keys(d).length > 0, 'Nada para atualizar');
export type UpdateItineraryInput = z.infer<typeof UpdateItineraryInputSchema>;
