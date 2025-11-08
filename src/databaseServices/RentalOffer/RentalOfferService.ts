import { IRentalOfferService } from './IRentalOfferService.js';
import { RentalOffer } from '../../schemas/index.js';
import { injectable } from 'inversify';
import { IRentalOffer } from '../../models/index.js';

@injectable()
export class RentalOfferService implements IRentalOfferService<IRentalOffer> {

  async findById(id: string): Promise<IRentalOffer | null> {
    return RentalOffer.findById(id).exec();
  }

  async create(data: Partial<IRentalOffer>): Promise<IRentalOffer> {
    const newRentalOffer = new RentalOffer(data);
    return newRentalOffer.save();
  }
}
