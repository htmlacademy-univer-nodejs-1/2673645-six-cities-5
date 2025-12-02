// src/app/controllers/user.controller.ts

import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { Logger } from 'pino';
import { BaseController } from '../../shared/controllers/base.controller.js';
import { TYPES } from '../../shared/ioc/ioc-container.js';
import { UserService } from '../../shared/services/user.service.js';
import { CreateUserDto } from '../../shared/dto/user/create-user.dto.js';
import { LoginUserDto } from '../../shared/dto/user/login-user.dto.js';
import { ValidateObjectIdMiddleware } from '../../shared/middlewares/validate-object-id.middleware.js';
import { ValidateDtoMiddleware } from '../../shared/middlewares/validate-dto.middleware.js';
import { NotFoundError, ConflictError, UnauthorizedError, BadRequestError } from '../../shared/errors/http-error.js';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(TYPES.Logger) logger: Logger,
    @inject(TYPES.UserService) private userService: UserService
  ) {
    super(logger);
  }

  protected initializeRoutes(): void {
    const validateCreateUser = new ValidateDtoMiddleware(CreateUserDto, this.logger);
    const validateLoginUser = new ValidateDtoMiddleware(LoginUserDto, this.logger);
    const validateObjectId = new ValidateObjectIdMiddleware('id');

    this.addRoute({
      path: '/users/register',
      method: 'post',
      middlewares: [validateCreateUser],
      handler: this.register
    });

    this.addRoute({
      path: '/users/login',
      method: 'post',
      middlewares: [validateLoginUser],
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
      path: '/users/:id',
      method: 'get',
      middlewares: [validateObjectId],
      handler: this.show
    });

    this.addRoute({
      path: '/users/:id/avatar',
      method: 'post',
      middlewares: [validateObjectId],
      handler: this.uploadAvatar
    });
  }

  private async register(req: Request, res: Response): Promise<void> {
    const dto = new CreateUserDto(req.body);

    this.logger.info(`Registration attempt for user: ${dto.email}`);

    const existingUser = await this.userService.findByEmail(dto.email);

    if (existingUser) {
      this.logger.warn(`Registration failed: User with email ${dto.email} already exists`);
      throw new ConflictError(`User with email ${dto.email} already exists`);
    }

    const user = await this.userService.create(dto);

    const userResponse = this.sanitizeUserResponse(user);

    this.logger.info(`User registered successfully: ${user.email} (id: ${user.id})`);
    this.created(res, userResponse);
  }

  private async login(req: Request, res: Response): Promise<void> {
    const dto = new LoginUserDto(req.body);

    this.logger.info(`Login attempt for user: ${dto.email}`);

    const user = await this.userService.findByEmail(dto.email);

    if (!user) {
      this.logger.warn(`Login failed: User with email ${dto.email} not found`);
      throw new UnauthorizedError('Invalid email or password');
    }

    const userResponse = this.sanitizeUserResponse(user);

    this.logger.info(`User logged in successfully: ${user.email}`);

    this.ok(res, {
      user: userResponse,
      message: 'Login successful'
    });
  }

  private async checkAuth(req: Request, res: Response): Promise<void> {
    const userId = req.query.userId as string;

    if (!userId) {
      this.logger.warn('Auth check failed: No user ID provided');
      throw new UnauthorizedError('Not authenticated');
    }

    this.logger.info(`Checking auth status for user: ${userId}`);

    const user = await this.userService.findById(userId);

    if (!user) {
      this.logger.warn(`Auth check failed: User ${userId} not found`);
      throw new UnauthorizedError('User not found');
    }

    const userResponse = this.sanitizeUserResponse(user);

    this.logger.info(`Auth check successful for user: ${user.email}`);
    this.ok(res, userResponse);
  }

  private async logout(req: Request, res: Response): Promise<void> {
    this.logger.info('User logged out successfully');
    this.noContent(res);
  }

  private async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    this.logger.info(`Fetching user with id: ${id}`);

    const user = await this.userService.findById(id);

    if (!user) {
      this.logger.warn(`User with id ${id} not found`);
      throw new NotFoundError(`User with id ${id} not found`);
    }

    const userResponse = this.sanitizeUserResponse(user);

    this.logger.info(`User ${id} retrieved successfully`);
    this.ok(res, userResponse);
  }

  private async uploadAvatar(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const avatarPath = req.body.avatarPath;

    if (!avatarPath) {
      throw new BadRequestError('Avatar file is required');
    }

    this.logger.info(`Uploading avatar for user: ${id}`);

    const user = await this.userService.updateAvatar(id, avatarPath);

    if (!user) {
      this.logger.warn(`User with id ${id} not found for avatar upload`);
      throw new NotFoundError(`User with id ${id} not found`);
    }

    const userResponse = this.sanitizeUserResponse(user);

    this.logger.info(`Avatar uploaded successfully for user: ${id}`);
    this.ok(res, userResponse);
  }

  private sanitizeUserResponse(user: any): object {
    const userObject = user.toObject ? user.toObject() : user;
    const { password, ...sanitized } = userObject;
    return sanitized;
  }
}
