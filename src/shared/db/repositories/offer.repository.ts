import { Logger } from 'pino';
import { BaseRepository } from './base.repository.js';
import { IOffer, OfferModel } from '../models/offer.schema.js';

export class OfferRepository extends BaseRepository<IOffer> {
  constructor(logger: Logger) {
    super(OfferModel, logger);
  }

  async findByCity(city: string): Promise<IOffer[]> {
    return this.find({ city });
  }

  async findPremium(): Promise<IOffer[]> {
    return this.find({ isPremium: true });
  }
}
