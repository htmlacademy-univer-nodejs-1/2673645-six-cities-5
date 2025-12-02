import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { Logger } from 'pino';
import { BaseController } from '../../shared/controllers/base.controller.js';
import { TYPES } from '../../shared/ioc/ioc-container.js';
import { CommentService } from '../../shared/services/comment.service.js';
import { OfferService } from '../../shared/services/offer.service.js';
import { CreateCommentDto } from '../../shared/dto/comment/create-comment.dto.js';
import { ValidateObjectIdMiddleware } from '../../shared/middlewares/validate-object-id.middleware.js';
import { ValidateDtoMiddleware } from '../../shared/middlewares/validate-dto.middleware.js';
import { CheckEntityExistsMiddleware } from '../../shared/middlewares/check-entity-exists.middleware.js';
import { BadRequestError } from '../../shared/errors/http-error.js';

@injectable()
export class CommentController extends BaseController {
  constructor(
    @inject(TYPES.Logger) logger: Logger,
    @inject(TYPES.CommentService) private commentService: CommentService,
    @inject(TYPES.OfferService) private offerService: OfferService
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

    this.addRoute({
      path: '/comments/:offerId',
      method: 'get',
      middlewares: [validateObjectId, checkOfferExists],
      handler: this.index
    });

    this.addRoute({
      path: '/comments/:offerId',
      method: 'post',
      middlewares: [validateObjectId, checkOfferExists, validateCreateComment],
      handler: this.create
    });
  }

  private async index(req: Request, res: Response): Promise<void> {
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

  private async create(req: Request, res: Response): Promise<void> {
    const { offerId } = req.params;
    const dto = new CreateCommentDto(req.body);
    dto.authorId = req.body.authorId;
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
