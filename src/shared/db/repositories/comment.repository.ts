import { Logger } from 'pino';
import { BaseRepository } from './base.repository.js';
import { IComment, CommentModel } from '../models/comment.schema.js';
import mongoose from 'mongoose';

export class CommentRepository extends BaseRepository<IComment> {
  constructor(logger: Logger) {
    super(CommentModel, logger);
  }

  async findByOfferId(offerId: string, limit = 50): Promise<IComment[]> {
    try {
      return await this.model
        .find({ offer: offerId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('author', 'name email avatarPath type')
        .exec();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error finding comments by offer: ${msg}`);
      throw error;
    }
  }

  async countByOfferId(offerId: string): Promise<number> {
    try {
      return await this.model.countDocuments({ offer: offerId }).exec();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error counting comments: ${msg}`);
      throw error;
    }
  }

  async calculateAverageRating(offerId: string): Promise<number> {
    try {
      const result = await this.model.aggregate([
        { $match: { offer: new mongoose.Types.ObjectId(offerId) } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' }
          }
        }
      ]);

      return result.length > 0 ? Math.round(result[0].avgRating * 10) / 10 : 0;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error calculating average rating: ${msg}`);
      throw error;
    }
  }
}
