import { z } from 'zod';

// Criação de Avaliação
export const CreateReviewInputSchema = z.object({
  rating: z.number().int().min(1, 'Nota mínima é 1').max(5, 'Nota máxima é 5'),
  comment: z.string().trim().max(1000, 'Comentário pode ter no máximo 1000 caracteres').optional(),
}).strict();

export type CreateReviewInput = z.infer<typeof CreateReviewInputSchema>;

// Resposta da Avaliação
export const ReviewResponseSchema = z.object({
  id: z.string().uuid(),
  rating: z.number(),
  comment: z.string().nullable(),
  createdAt: z.string().or(z.date()),
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
    avatarUrl: z.string().nullable(),
  }),
  reply: z
    .object({
      id: z.string().uuid(),
      comment: z.string(),
      createdAt: z.string().or(z.date()),
    })
    .nullable()
    .optional(),
});

export type ReviewResponse = z.infer<typeof ReviewResponseSchema>;

// Resposta do Comerciante à Avaliação
export const ReplyReviewInputSchema = z.object({
  comment: z.string().trim().min(2).max(1000),
}).strict();

export type ReplyReviewInput = z.infer<typeof ReplyReviewInputSchema>;
