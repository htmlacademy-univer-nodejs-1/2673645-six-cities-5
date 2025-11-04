import { Document } from 'mongoose';

export interface IRentalOfferService<T extends Document> {
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
}