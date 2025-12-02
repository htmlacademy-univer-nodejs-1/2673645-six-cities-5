import { injectable, inject } from 'inversify';
import { Logger } from 'pino';
import mongoose from 'mongoose';
import { TYPES } from '../ioc/ioc-container.js';
import { OfferRepository } from '../db/repositories/offer.repository.js';
import { CreateOfferDto } from '../dto/offer/create-offer.dto.js';
import { UpdateOfferDto } from '../dto/offer/update-offer.dto.js';
import { IOffer } from '../db/models/offer.schema.js';
import { IEntityService } from '../interfaces/entity-service.interface.js';

@injectable()
export class OfferService implements IEntityService {
  constructor(
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.OfferRepository) private offerRepository: OfferRepository
  ) {}

  async findById(id: string): Promise<IOffer | null> {
    try {
      return await this.offerRepository.findByIdWithAuthor(id);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error finding offer: ${msg}`);
      throw error;
    }
  }

  async findAll(limit = 60, userId?: string): Promise<IOffer[]> {
    try {
      const offers = await this.offerRepository.findAll(limit);
      return this.addFavoriteFlags(offers, userId);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error finding all offers: ${msg}`);
      throw error;
    }
  }

  async create(dto: CreateOfferDto): Promise<IOffer> {
    try {
      if (!mongoose.Types.ObjectId.isValid(dto.authorId)) {
        throw new Error('Invalid author ID');
      }

      return await this.offerRepository.create({
        title: dto.title,
        description: dto.description,
        city: dto.city,
        previewImage: dto.previewImage,
        images: dto.images,
        isPremium: dto.isPremium,
        type: dto.type,
        bedrooms: dto.bedrooms,
        maxAdults: dto.maxAdults,
        price: dto.price,
        amenities: dto.amenities,
        author: new mongoose.Types.ObjectId(dto.authorId),
        coordinates: dto.coordinates,
        rating: 0,
        commentsCount: 0,
        isFavorite: false,
        favorites: []
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error creating offer: ${msg}`);
      throw error;
    }
  }

  async update(id: string, dto: UpdateOfferDto): Promise<IOffer | null> {
    try {
      return await this.offerRepository.update(id, dto);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error updating offer: ${msg}`);
      throw error;
    }
  }

  async findByCity(city: string, limit?: number, userId?: string): Promise<IOffer[]> {
    try {
      const offers = await this.offerRepository.findByCity(city, limit);
      return this.addFavoriteFlags(offers, userId);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error finding offers by city: ${msg}`);
      throw error;
    }
  }

  async findPremium(city: string, userId?: string): Promise<IOffer[]> {
    try {
      const offers = await this.offerRepository.findPremiumByCity(city);
      return this.addFavoriteFlags(offers, userId);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error finding premium offers: ${msg}`);
      throw error;
    }
  }

  async findFavorites(userId: string): Promise<IOffer[]> {
    try {
      return await this.offerRepository.findFavoritesByUserId(userId);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error finding favorites: ${msg}`);
      throw error;
    }
  }

  async addToFavorites(offerId: string, userId: string): Promise<IOffer | null> {
    try {
      return await this.offerRepository.addToFavorites(offerId, userId);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error adding to favorites: ${msg}`);
      throw error;
    }
  }

  async removeFromFavorites(offerId: string, userId: string): Promise<IOffer | null> {
    try {
      return await this.offerRepository.removeFromFavorites(offerId, userId);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error removing from favorites: ${msg}`);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      return await this.offerRepository.delete(id);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error deleting offer: ${msg}`);
      throw error;
    }
  }

  private addFavoriteFlags(offers: IOffer[], userId?: string): IOffer[] {
    return offers.map((offer) => ({
      ...offer,
      isFavorite: userId ? offer.favorites.includes(new mongoose.Types.ObjectId(userId)) : false
    }));
  }
}
