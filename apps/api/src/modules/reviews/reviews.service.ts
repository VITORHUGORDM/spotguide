import { CreateReviewInput, ReplyReviewInput } from '@guia/contracts';
import { prisma } from '../../shared/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';

export class ReviewsService {
  async listByPlace(placeId: string) {
    return prisma.review.findMany({
      where: { placeId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        reply: {
          select: {
            id: true,
            comment: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Prevenção contra TOCTTOU & Inconsistência de Média:
  // Executado em transação atômica no banco de dados
  async createReview(placeId: string, userId: string, data: CreateReviewInput) {
    const place = await prisma.place.findUnique({
      where: { id: placeId },
      select: { id: true, isActive: true },
    });

    if (!place || !place.isActive) {
      throw new AppError('Estabelecimento não encontrado.', 404);
    }

    return prisma.$transaction(async (tx) => {
      // 1. Cria a avaliação do usuário (o banco garante unicidade por [placeId, userId])
      const review = await tx.review.create({
        data: {
          placeId,
          userId,
          rating: data.rating,
          comment: data.comment,
        },
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      });

      // 2. Agrega atomicamente a nova média e total de avaliações
      const aggregate = await tx.review.aggregate({
        where: { placeId },
        _avg: { rating: true },
        _count: { id: true },
      });

      const newAverage = aggregate._avg.rating ? Number(aggregate._avg.rating.toFixed(1)) : 0;
      const totalReviews = aggregate._count.id;

      // 3. Atualiza o local denormalizado
      await tx.place.update({
        where: { id: placeId },
        data: {
          averageRating: newAverage,
          totalReviews,
        },
      });

      return review;
    });
  }

  async replyReview(reviewId: string, merchantId: string, data: ReplyReviewInput) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        place: {
          select: { ownerId: true },
        },
      },
    });

    if (!review) {
      throw new AppError('Avaliação não encontrada.', 404);
    }

    if (review.place.ownerId !== merchantId) {
      throw new AppError('Você só pode responder avaliações do seu próprio estabelecimento.', 403);
    }

    return prisma.reviewReply.upsert({
      where: { reviewId },
      create: {
        reviewId,
        merchantId,
        comment: data.comment,
      },
      update: {
        comment: data.comment,
      },
    });
  }
}
