import { injectable, inject } from 'inversify';
import { Logger } from 'pino';
import mongoose from 'mongoose';
import { TYPES } from '../ioc/ioc-container.js';
import { CommentRepository } from '../db/repositories/comment.repository.js';
import { OfferRepository } from '../db/repositories/offer.repository.js';
import { CreateCommentDto } from '../dto/comment/create-comment.dto.js';
import { IComment } from '../db/models/comment.schema.js';

@injectable()
export class CommentService {
  constructor(
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.CommentRepository) private commentRepository: CommentRepository,
    @inject(TYPES.OfferRepository) private offerRepository: OfferRepository
  ) {}

  async create(dto: CreateCommentDto): Promise<IComment> {
    try {
      const comment = await this.commentRepository.create({
        text: dto.text,
        rating: dto.rating,
        author: new mongoose.Types.ObjectId(dto.authorId),
        offer: new mongoose.Types.ObjectId(dto.offerId)
      });

      const commentsCount = await this.commentRepository.countByOfferId(dto.offerId);
      await this.offerRepository.updateCommentsCount(dto.offerId, commentsCount);

      const avgRating = await this.commentRepository.calculateAverageRating(dto.offerId);
      await this.offerRepository.updateRating(dto.offerId, avgRating);

      this.logger.info(`Comment created for offer ${dto.offerId}. New rating: ${avgRating}, comments: ${commentsCount}`);

      return comment;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error creating comment: ${msg}`);
      throw error;
    }
  }

  async findByOfferId(offerId: string, limit = 50): Promise<IComment[]> {
    return this.commentRepository.findByOfferId(offerId, limit);
  }
}
