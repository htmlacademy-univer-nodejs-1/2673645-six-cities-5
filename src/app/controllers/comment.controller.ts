import { injectable, inject } from 'inversify';
import { Response } from 'express';
import { Logger } from 'pino';
import { BaseController } from '../../shared/controllers/base.controller.js';
import { TYPES } from '../../shared/ioc/ioc-container.js';
import { CommentService } from '../../shared/services/comment.service.js';
import { OfferService } from '../../shared/services/offer.service.js';
import { CreateCommentDto } from '../../shared/dto/comment/create-comment.dto.js';
import { ValidateObjectIdMiddleware } from '../../shared/middlewares/validate-object-id.middleware.js';
import { ValidateDtoMiddleware } from '../../shared/middlewares/validate-dto.middleware.js';
import { CheckEntityExistsMiddleware } from '../../shared/middlewares/check-entity-exists.middleware.js';
import { AuthenticateMiddleware } from '../../shared/middlewares/authenticate.middleware.js';
import { JwtService } from '../../shared/libs/jwt.js';
import { AuthenticatedRequest } from '../../shared/interfaces/authenticated-request.interface.js';
import { BadRequestError, UnauthorizedError } from '../../shared/errors/http-error.js';

@injectable()
export class CommentController extends BaseController {
  constructor(
    @inject(TYPES.Logger) logger: Logger,
    @inject(TYPES.CommentService) private commentService: CommentService,
    @inject(TYPES.OfferService) private offerService: OfferService,
    @inject(TYPES.JwtService) private jwtService: JwtService
  ) {
    super(logger);
  }

  protected initializeRoutes(): void {
    const validateObjectId = new ValidateObjectIdMiddleware('offerId');
    const validateCreateComment = new ValidateDtoMiddleware(CreateCommentDto, this.logger);
    const checkOfferExists = new CheckEntityExistsMiddleware(
      this.offerService,
      'offerId',
      'Offer',
      this.logger
    );
    const authenticate = new AuthenticateMiddleware(this.jwtService, this.logger);

    // Публичный маршрут
    this.addRoute({
      path: '/comments/:offerId',
      method: 'get',
      middlewares: [validateObjectId, checkOfferExists],
      handler: this.index
    });

    // Защищенный маршрут (требует аутентификации)
    this.addRoute({
      path: '/comments/:offerId',
      method: 'post',
      middlewares: [authenticate, validateObjectId, checkOfferExists, validateCreateComment],
      handler: this.create
    });
  }

  private async index(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { offerId } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 50;

    if (isNaN(limit) || limit < 1 || limit > 50) {
      throw new BadRequestError('Limit must be a number between 1 and 50');
    }

    this.logger.info(`Fetching comments for offer: ${offerId}, limit: ${limit}`);

    const comments = await this.commentService.findByOfferId(offerId, limit);

    this.logger.info(`Retrieved ${comments.length} comments for offer ${offerId}`);
    this.ok(res, comments);
  }

  private async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { offerId } = req.params;
    const dto = new CreateCommentDto(req.body);
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError('Authentication required');
    }

    dto.authorId = userId;
    dto.offerId = offerId;

    if (!dto.authorId) {
      throw new BadRequestError('Author ID is required');
    }

    this.logger.info(`Creating comment for offer ${offerId} by user ${dto.authorId}`);
    this.logger.debug(`Comment data: rating=${dto.rating}, text length=${dto.text.length}`);

    const comment = await this.commentService.create(dto);

    this.logger.info(`Comment created successfully: ${comment.id}`);
    this.created(res, comment);
  }
}
