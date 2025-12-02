import { injectable, inject } from 'inversify';
import { Logger } from 'pino';
import { TYPES } from '../ioc/ioc-container.js';
import { UserRepository } from '../db/repositories/user.repository.js';
import { CreateUserDto } from '../dto/user/create-user.dto.js';
import { IUser } from '../db/models/user.schema.js';
import { IEntityService } from '../interfaces/entity-service.interface.js';
import { PasswordService } from '../libs/password.js';
import { JwtService } from '../libs/jwt.js';

@injectable()
export class UserService implements IEntityService {
  constructor(
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.PasswordService) private passwordService: PasswordService,
    @inject(TYPES.JwtService) private jwtService: JwtService
  ) {}

  async findById(id: string): Promise<IUser | null> {
    try {
      return await this.userRepository.findById(id);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error finding user by id: ${msg}`);
      throw error;
    }
  }

  async create(dto: CreateUserDto): Promise<IUser> {
    try {
      const hashedPassword = await this.passwordService.hash(dto.password);

      return await this.userRepository.create({
        name: dto.name,
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        type: dto.type,
        avatarPath: dto.avatarPath
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error creating user: ${msg}`);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await this.userRepository.findByEmail(email.toLowerCase());
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error finding user by email: ${msg}`);
      throw error;
    }
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await this.passwordService.compare(password, hashedPassword);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error verifying password: ${msg}`);
      throw error;
    }
  }

  async generateToken(user: IUser): Promise<string> {
    try {
      return await this.jwtService.generateToken(user);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error generating token: ${msg}`);
      throw error;
    }
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
