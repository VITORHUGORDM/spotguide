import { CreateReviewInput, ReplyReviewInput, ListReviewsQuery } from '@guia/contracts';
import { prisma } from '../../shared/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';

export class ReviewsService {
  /** Uma página das avaliações (mais recentes primeiro) e o total, para o "carregar mais". */
  async listByPlace(placeId: string, { page, limit }: ListReviewsQuery) {
    const where = { placeId };
    const [items, total] = await prisma.$transaction([
      prisma.review.findMany({
        where,
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
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);
    return { items, total };
  }

  // Prevenção contra TOCTTOU & Inconsistência de Média:
  // Executado em transação atômica no banco de dados
  async createReview(placeId: string, userId: string, data: CreateReviewInput) {
    const place = await prisma.place.findUnique({
      where: { id: placeId },
      select: { id: true, isActive: true, ownerId: true },
    });

    if (!place || !place.isActive) {
      throw new AppError('Estabelecimento não encontrado.', 404);
    }

    // o dono avaliando o próprio negócio inflaria a nota
    if (place.ownerId === userId) {
      throw new AppError('Você não pode avaliar o seu próprio estabelecimento.', 403);
    }

    return prisma.$transaction(async (tx) => {
      // 0. Trava a linha do local: duas avaliações ao mesmo tempo calculam a média uma depois da outra,
      //    e a segunda já enxerga a primeira (sem isso, a última a gravar apagava a outra da média)
      await tx.$queryRaw`SELECT id FROM places WHERE id = ${placeId}::uuid FOR UPDATE`;

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

      // 2. Agrega a nova média e total de avaliações
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

  async replyReview(reviewId: string, user: { id: string; role: string }, data: ReplyReviewInput) {
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

    // administrador pode responder qualquer avaliação, como já pode editar qualquer local
    if (user.role !== 'ADMIN' && review.place.ownerId !== user.id) {
      throw new AppError('Você só pode responder avaliações do seu próprio estabelecimento.', 403);
    }

    return prisma.reviewReply.upsert({
      where: { reviewId },
      create: {
        reviewId,
        merchantId: user.id,
        comment: data.comment,
      },
      update: {
        comment: data.comment,
      },
    });
  }
}
