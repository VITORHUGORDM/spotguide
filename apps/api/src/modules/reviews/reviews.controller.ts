import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateReviewInputSchema, ReplyReviewInputSchema, ListReviewsQuerySchema } from '@guia/contracts';
import { ReviewsService } from './reviews.service.js';

export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  async listByPlace(request: FastifyRequest, reply: FastifyReply) {
    const { placeId } = request.params as { placeId: string };
    const query = ListReviewsQuerySchema.parse(request.query);
    const { items, total } = await this.reviewsService.listByPlace(placeId, query);
    return reply.header('X-Total-Count', total).status(200).send(items);
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const { placeId } = request.params as { placeId: string };
    const body = CreateReviewInputSchema.parse(request.body);
    const userId = request.user.sub;

    const review = await this.reviewsService.createReview(placeId, userId, body);
    return reply.status(201).send(review);
  }

  async reply(request: FastifyRequest, reply: FastifyReply) {
    const { reviewId } = request.params as { reviewId: string };
    const body = ReplyReviewInputSchema.parse(request.body);

    const replyRecord = await this.reviewsService.replyReview(
      reviewId,
      { id: request.user.sub, role: request.user.role },
      body
    );
    return reply.status(200).send(replyRecord);
  }
}
