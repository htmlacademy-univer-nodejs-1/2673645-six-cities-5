import { injectable } from 'inversify';
import { IUser, UserType } from '../../models/index.js';
import { User } from '../../schemas/index.js';
import { IUserService } from './IUserService.js';

@injectable()
export class UserService implements IUserService<IUser> {
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).exec();
  }

  async findOne(query: { email: string }): Promise<IUser | null> {
    return User.findOne(query).exec();
  }

  async create(data: {
    name: string;
    email: string;
    avatar?: string;
    password: string;
    type: UserType;
  }): Promise<IUser> {
    const newUser = new User(data);
    return newUser.save();
  }
}
