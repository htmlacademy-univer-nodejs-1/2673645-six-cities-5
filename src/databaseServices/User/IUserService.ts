import { Document } from 'mongoose';

export interface IUserService<T extends Document> {

  findById(id: string): Promise<T | null>;

  findOne(query: object): Promise<T | null>;

  create(data: Partial<T>): Promise<T>;
}
