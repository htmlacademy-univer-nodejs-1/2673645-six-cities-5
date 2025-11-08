import { Logger } from 'pino';
import {
  Document,
  FilterQuery,
  Model
} from 'mongoose';

export interface IRepository<T extends Document> {
  create(doc: Partial<T>): Promise<T>;
  find(filter?: FilterQuery<T>): Promise<T[]>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  findById(id: string): Promise<T | null>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  insertMany(docs: Partial<T>[]): Promise<any[]>;
}

export class BaseRepository<T extends Document> implements IRepository<T> {
  constructor(
    protected model: Model<T>,
    protected logger: Logger
  ) {}

  async create(doc: Partial<T>): Promise<T> {
    try {
      const createdDoc = new this.model(doc);
      return await createdDoc.save();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error creating document: ${msg}`);
      throw error;
    }
  }

  async find(filter: FilterQuery<T> = {}): Promise<T[]> {
    try {
      return await this.model.find(filter).exec();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error finding documents: ${msg}`);
      throw error;
    }
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    try {
      return await this.model.findOne(filter).exec();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error finding document: ${msg}`);
      throw error;
    }
  }

  async findById(id: string): Promise<T | null> {
    try {
      return await this.model.findById(id).exec();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error finding document by id: ${msg}`);
      throw error;
    }
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error updating document: ${msg}`);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error deleting document: ${msg}`);
      throw error;
    }
  }

  async insertMany(docs: Partial<T>[]): Promise<any[]> {
    try {
      return await this.model.insertMany(docs, { ordered: false }) as any[];
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error bulk inserting documents: ${msg}`);
      throw error;
    }
  }
}
