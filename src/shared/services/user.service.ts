import { injectable, inject } from 'inversify';
import { Logger } from 'pino';
import { TYPES } from '../ioc/ioc-container.js';
import { UserRepository } from '../db/repositories/user.repository.js';
import { CreateUserDto } from '../dto/user/create-user.dto.js';
import { IUser } from '../db/models/user.schema.js';

@injectable()
export class UserService {
  constructor(
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.UserRepository) private userRepository: UserRepository
  ) {}

  async create(dto: CreateUserDto): Promise<IUser> {
    try {
      return await this.userRepository.create({
        name: dto.name,
        email: dto.email,
        password: dto.password,
        type: dto.type,
        avatarPath: dto.avatarPath
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error creating user: ${msg}`);
      throw error;
    }
  }

  async findById(id: string): Promise<IUser | null> {
    return this.userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.userRepository.findByEmail(email);
  }

  async updateAvatar(id: string, avatarPath: string): Promise<IUser | null> {
    try {
      return await this.userRepository.update(id, { avatarPath });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error updating avatar: ${msg}`);
      throw error;
    }
  }
}
