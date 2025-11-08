// src/shared/db/repositories/offer.repository.ts

import { Logger } from 'pino';
import { BaseRepository } from './base.repository.js';
import { IOffer, OfferModel } from '../models/offer.schema.js';
import mongoose from 'mongoose';

export class OfferRepository extends BaseRepository<IOffer> {
  constructor(logger: Logger) {
    super(OfferModel, logger);
  }

  async findByCity(city: string, limit = 60): Promise<IOffer[]> {
    try {
      return await this.model
        .find({ city })
        .limit(limit)
        .sort({ publishDate: -1 })
        .exec();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error finding offers by city: ${msg}`);
      throw error;
    }
  }

  async findPremiumByCity(city: string, limit = 3): Promise<IOffer[]> {
    try {
      return await this.model
        .find({ city, isPremium: true })
        .limit(limit)
        .sort({ publishDate: -1 })
        .exec();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error finding premium offers: ${msg}`);
      throw error;
    }
  }

  async findFavoritesByUserId(userId: string): Promise<IOffer[]> {
    try {
      return await this.model
        .find({ favorites: userId })
        .sort({ publishDate: -1 })
        .exec();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error finding favorites: ${msg}`);
      throw error;
    }
  }

  async updateCommentsCount(offerId: string, count: number): Promise<void> {
    try {
      await this.model
        .findByIdAndUpdate(
          offerId,
          { commentsCount: count },
          { new: true }
        )
        .exec();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error updating comments count: ${msg}`);
      throw error;
    }
  }

  async updateRating(offerId: string, rating: number): Promise<void> {
    try {
      await this.model
        .findByIdAndUpdate(
          offerId,
          { rating },
          { new: true }
        )
        .exec();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error updating rating: ${msg}`);
      throw error;
    }
  }

  async addToFavorites(offerId: string, userId: string): Promise<IOffer | null> {
    try {
      return await this.model
        .findByIdAndUpdate(
          offerId,
          { $addToSet: { favorites: userId }, isFavorite: true },
          { new: true }
        )
        .exec();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error adding to favorites: ${msg}`);
      throw error;
    }
  }

  async removeFromFavorites(offerId: string, userId: string): Promise<IOffer | null> {
    try {
      const offer = await this.model
        .findByIdAndUpdate(
          offerId,
          { $pull: { favorites: userId } },
          { new: true }
        )
        .exec();

      if (offer && offer.favorites.length === 0) {
        offer.isFavorite = false;
        await offer.save();
      }

      return offer;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error removing from favorites: ${msg}`);
      throw error;
    }
  }

  async findAll(limit = 60): Promise<IOffer[]> {
    try {
      return await this.model
        .find()
        .limit(limit)
        .sort({ publishDate: -1 })
        .populate('author', 'name email type avatarPath')
        .exec();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error finding all offers: ${msg}`);
      throw error;
    }
  }

  async findByIdWithAuthor(offerId: string): Promise<IOffer | null> {
    try {
      return await this.model
        .findById(offerId)
        .populate('author', 'name email type avatarPath')
        .exec();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error finding offer with author: ${msg}`);
      throw error;
    }
  }
}
