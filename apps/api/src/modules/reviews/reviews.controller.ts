import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateReviewInputSchema } from '@guia/contracts';
import { ReviewsService } from './reviews.service.js';

export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  async listByPlace(request: FastifyRequest, reply: FastifyReply) {
    const { placeId } = request.params as { placeId: string };
    const reviews = await this.reviewsService.listByPlace(placeId);
    return reply.status(200).send(reviews);
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const { placeId } = request.params as { placeId: string };
    const body = CreateReviewInputSchema.parse(request.body);
    const userId = request.user.sub;

    const review = await this.reviewsService.createReview(placeId, userId, body);
    return reply.status(201).send(review);
  }
}
