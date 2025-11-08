import { Logger } from 'pino';
import { BaseRepository } from './base.repository.js';
import { IUser, UserModel } from '../models/user.schema.js';

export class UserRepository extends BaseRepository<IUser> {
  constructor(logger: Logger) {
    super(UserModel, logger);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email: email.toLowerCase() });
  }
}
