// src/app/controllers/user.controller.ts

import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { Logger } from 'pino';
import { BaseController } from '../../shared/controllers/base.controller.js';
import { TYPES } from '../../shared/ioc/ioc-container.js';
import { UserService } from '../../shared/services/user.service.js';
import { CreateUserDto } from '../../shared/dto/user/create-user.dto.js';
import { LoginUserDto } from '../../shared/dto/user/login-user.dto.js';
import { NotFoundError, ConflictError, UnauthorizedError } from '../../shared/errors/http-error.js';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(TYPES.Logger) logger: Logger,
    @inject(TYPES.UserService) private userService: UserService
  ) {
    super(logger);
  }

  protected initializeRoutes(): void {
    this.addRoute({
      path: '/users/register',
      method: 'post',
      handler: this.register
    });

    this.addRoute({
      path: '/users/login',
      method: 'post',
      handler: this.login
    });

    this.addRoute({
      path: '/users/login',
      method: 'get',
      handler: this.checkAuth
    });

    this.addRoute({
      path: '/users/logout',
      method: 'post',
      handler: this.logout
    });

    this.addRoute({
      path: '/users/:id/avatar',
      method: 'post',
      handler: this.uploadAvatar
    });
  }

  private async register(req: Request, res: Response): Promise<void> {
    const dto = new CreateUserDto(req.body);

    this.logger.info(`Registering new user: ${dto.email}`);

    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictError(`User with email ${dto.email} already exists`);
    }

    const user = await this.userService.create(dto);

    const { password, ...userResponse } = user.toObject();

    this.logger.info(`User registered successfully: ${user.email}`);
    this.created(res, userResponse);
  }

  private async login(req: Request, res: Response): Promise<void> {
    const dto = new LoginUserDto(req.body);

    this.logger.info(`Login attempt for user: ${dto.email}`);

    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const { password, ...userResponse } = user.toObject();

    this.logger.info(`User logged in successfully: ${user.email}`);
    this.ok(res, {
      // token,
      user: userResponse
    });
  }

  private async checkAuth(req: Request, res: Response): Promise<void> {
    const userId = req.query.userId as string;

    if (!userId) {
      throw new UnauthorizedError('Not authenticated');
    }

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const { password, ...userResponse } = user.toObject();

    this.ok(res, userResponse);
  }

  private async logout(req: Request, res: Response): Promise<void> {
    this.logger.info('User logged out');
    this.noContent(res);
  }

  private async uploadAvatar(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const avatarPath = req.body.avatarPath;

    if (!avatarPath) {
      throw new Error('Avatar file is required');
    }

    this.logger.info(`Uploading avatar for user: ${id}`);

    const user = await this.userService.updateAvatar(id, avatarPath);
    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }

    const { password, ...userResponse } = user.toObject();

    this.ok(res, userResponse);
  }
}
