import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { Logger } from 'pino';
import { BaseController } from '../../shared/controllers/base.controller.js';
import { TYPES } from '../../shared/ioc/ioc-container.js';
import { CommentService } from '../../shared/services/comment.service.js';
import { CreateCommentDto } from '../../shared/dto/comment/create-comment.dto.js';
import { ValidateObjectIdMiddleware } from '../../shared/middlewares/validate-object-id.middleware.js';
import { ValidateDtoMiddleware } from '../../shared/middlewares/validate-dto.middleware.js';
import { NotFoundError } from '../../shared/errors/http-error.js';

@injectable()
export class CommentController extends BaseController {
  constructor(
    @inject(TYPES.Logger) logger: Logger,
    @inject(TYPES.CommentService) private commentService: CommentService
  ) {
    super(logger);
  }

  protected initializeRoutes(): void {
    this.addRoute({
      path: '/comments/:offerId',
      method: 'get',
      middlewares: [
        new ValidateObjectIdMiddleware('offerId')
      ],
      handler: this.index
    });

    this.addRoute({
      path: '/comments/:offerId',
      method: 'post',
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDtoMiddleware(CreateCommentDto, this.logger)
      ],
      handler: this.create
    });
  }

  private async index(req: Request, res: Response): Promise<void> {
    const { offerId } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 50;

    this.logger.info(`Fetching comments for offer: ${offerId}`);

    const comments = await this.commentService.findByOfferId(offerId, limit);

    this.ok(res, comments);
  }

  private async create(req: Request, res: Response): Promise<void> {
    const { offerId } = req.params;
    const dto = new CreateCommentDto(req.body);

    dto.authorId = req.body.authorId;
    dto.offerId = offerId;

    this.logger.info(`Creating comment for offer: ${offerId}`);

    const comment = await this.commentService.create(dto);

    this.created(res, comment);
  }
}
