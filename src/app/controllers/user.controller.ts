import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { Logger } from 'pino';
import convict from 'convict';
import { BaseController } from '../../shared/controllers/base.controller.js';
import { TYPES } from '../../shared/ioc/ioc-container.js';
import { UserService } from '../../shared/services/user.service.js';
import { CreateUserDto } from '../../shared/dto/user/create-user.dto.js';
import { LoginUserDto } from '../../shared/dto/user/login-user.dto.js';
import { ValidateObjectIdMiddleware } from '../../shared/middlewares/validate-object-id.middleware.js';
import { ValidateDtoMiddleware } from '../../shared/middlewares/validate-dto.middleware.js';
import { CheckEntityExistsMiddleware } from '../../shared/middlewares/check-entity-exists.middleware.js';
import { UploadFileMiddleware } from '../../shared/middlewares/upload-file.middleware.js';
import { AuthenticateMiddleware } from '../../shared/middlewares/authenticate.middleware.js';
import { JwtService } from '../../shared/libs/jwt.js';
import { AuthenticatedRequest } from '../../shared/interfaces/authenticated-request.interface.js';
import { ConflictError, UnauthorizedError, BadRequestError } from '../../shared/errors/http-error.js';
import { IUser } from '../../shared/db/models/user.schema.js';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(TYPES.Logger) logger: Logger,
    @inject(TYPES.UserService) private userService: UserService,
    @inject(TYPES.Config) private config: convict.Config<unknown>,
    @inject(TYPES.JwtService) private jwtService: JwtService
  ) {
    super(logger);
  }

  protected initializeRoutes(): void {
    const validateCreateUser = new ValidateDtoMiddleware(CreateUserDto, this.logger);
    const validateLoginUser = new ValidateDtoMiddleware(LoginUserDto, this.logger);
    const validateObjectId = new ValidateObjectIdMiddleware('id');
    const checkUserExists = new CheckEntityExistsMiddleware(
      this.userService,
      'id',
      'User',
      this.logger
    );
    const authenticate = new AuthenticateMiddleware(this.jwtService, this.logger);
    const uploadAvatar = new UploadFileMiddleware(
      {
        uploadDir: process.env.UPLOAD_DIR || './uploads',
        maxFileSize: 5 * 1024 * 1024,
        allowedMimes: ['image/jpeg', 'image/png', 'image/webp'],
        fieldName: 'avatar'
      },
      this.logger
    );

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
      path: '/users/:id',
      method: 'get',
      middlewares: [validateObjectId, checkUserExists],
      handler: this.show
    });

    this.addRoute({
      path: '/users/login',
      method: 'get',
      middlewares: [authenticate],
      handler: this.checkAuth
    });

    this.addRoute({
      path: '/users/logout',
      method: 'post',
      middlewares: [authenticate],
      handler: this.logout
    });

    this.addRoute({
      path: '/users/:id/avatar',
      method: 'post',
      middlewares: [authenticate, validateObjectId, checkUserExists, uploadAvatar],
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
    const token = await this.userService.generateToken(user);
    const userResponse = this.sanitizeUserResponse(user);

    this.logger.info(`User registered successfully: ${user.email}`);
    this.created(res, {
      user: userResponse,
      token
    });
  }

  private async login(req: Request, res: Response): Promise<void> {
    const dto = new LoginUserDto(req.body);

    this.logger.info(`Login attempt for user: ${dto.email}`);

    const user = await this.userService.findByEmail(dto.email);

    if (!user) {
      this.logger.warn(`Login failed: User with email ${dto.email} not found`);
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await this.userService.verifyPassword(dto.password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password for user ${dto.email}`);
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = await this.userService.generateToken(user);
    const userResponse = this.sanitizeUserResponse(user);

    this.logger.info(`User logged in successfully: ${user.email}`);

    this.ok(res, {
      token,
      user: userResponse
    });
  }

  private async checkAuth(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
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

  private async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    this.logger.info(`User ${userId} logged out`);
    this.noContent(res);
  }

  private async show(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = (req as AuthenticatedRequest & { entity: IUser }).entity;

    this.logger.info(`User ${user.id} retrieved successfully`);
    const userResponse = this.sanitizeUserResponse(user);
    this.ok(res, userResponse);
  }

  private async uploadAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?.id;
    const file = req.file;

    if (!file) {
      throw new BadRequestError('Avatar file is required');
    }

    if (userId !== id) {
      this.logger.warn(`User ${userId} tried to update avatar for user ${id}`);
      throw new UnauthorizedError('You can only update your own avatar');
    }

    const avatarPath = `/uploads/${file.filename}`;

    this.logger.info(`Uploading avatar for user: ${id}, filename: ${file.filename}`);

    const user = await this.userService.updateAvatar(id, avatarPath);

    const userResponse = this.sanitizeUserResponse(user);

    this.logger.info(`Avatar uploaded successfully for user: ${id}`);
    this.ok(res, userResponse);
  }

  private sanitizeUserResponse(user: IUser | null): Record<string, unknown> {
    if (!user) {
      return {};
    }

    const userObject = user.toObject ? user.toObject() : user;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...sanitized } = userObject;
    return sanitized;
  }
}
