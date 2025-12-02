import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { Logger } from 'pino';
import { BaseController } from '../../shared/controllers/base.controller.js';
import { TYPES } from '../../shared/ioc/ioc-container.js';
import { OfferService } from '../../shared/services/offer.service.js';
import { CreateOfferDto } from '../../shared/dto/offer/create-offer.dto.js';
import { UpdateOfferDto } from '../../shared/dto/offer/update-offer.dto.js';
import { ValidateObjectIdMiddleware } from '../../shared/middlewares/validate-object-id.middleware.js';
import { ValidateDtoMiddleware } from '../../shared/middlewares/validate-dto.middleware.js';
import { CheckEntityExistsMiddleware } from '../../shared/middlewares/check-entity-exists.middleware.js';
import { BadRequestError } from '../../shared/errors/http-error.js';

@injectable()
export class OfferController extends BaseController {
  constructor(
    @inject(TYPES.Logger) logger: Logger,
    @inject(TYPES.OfferService) private offerService: OfferService
  ) {
    super(logger);
  }

  protected initializeRoutes(): void {
    const validateObjectId = new ValidateObjectIdMiddleware('id');
    const validateCreateOffer = new ValidateDtoMiddleware(CreateOfferDto, this.logger);
    const validateUpdateOffer = new ValidateDtoMiddleware(UpdateOfferDto, this.logger);
    const checkOfferExists = new CheckEntityExistsMiddleware(
      this.offerService,
      'id',
      'Offer',
      this.logger
    );

    this.addRoute({
      path: '/offers',
      method: 'get',
      handler: this.index
    });

    this.addRoute({
      path: '/offers/premium',
      method: 'get',
      handler: this.premium
    });

    this.addRoute({
      path: '/offers/favorites',
      method: 'get',
      handler: this.favorites
    });

    this.addRoute({
      path: '/offers/:id',
      method: 'get',
      middlewares: [validateObjectId, checkOfferExists],
      handler: this.show
    });

    this.addRoute({
      path: '/offers',
      method: 'post',
      middlewares: [validateCreateOffer],
      handler: this.create
    });

    this.addRoute({
      path: '/offers/:id',
      method: 'patch',
      middlewares: [validateObjectId, checkOfferExists, validateUpdateOffer],
      handler: this.update
    });

    this.addRoute({
      path: '/offers/:id',
      method: 'delete',
      middlewares: [validateObjectId, checkOfferExists],
      handler: this.delete
    });

    this.addRoute({
      path: '/offers/:id/favorite',
      method: 'post',
      middlewares: [validateObjectId, checkOfferExists],
      handler: this.addFavorite
    });

    this.addRoute({
      path: '/offers/:id/favorite',
      method: 'delete',
      middlewares: [validateObjectId, checkOfferExists],
      handler: this.removeFavorite
    });
  }

  private async index(req: Request, res: Response): Promise<void> {
    const { city, limit } = req.query;

    this.logger.info(`Fetching offers with params: city=${city || 'all'}, limit=${limit || 60}`);

    const offers = city
      ? await this.offerService.findByCity(city as string, Number(limit) || 60)
      : await this.offerService.findAll(Number(limit) || 60);

    this.logger.info(`Retrieved ${offers.length} offers`);
    this.ok(res, offers);
  }

  private async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const offer = (req as any).entity;

    this.logger.info(`Offer ${id} retrieved successfully`);
    this.ok(res, offer);
  }

  private async create(req: Request, res: Response): Promise<void> {
    const dto = new CreateOfferDto(req.body);

    dto.authorId = req.body.authorId;

    if (!dto.authorId) {
      throw new BadRequestError('Author ID is required');
    }

    this.logger.info(`Creating new offer: ${dto.title} by author ${dto.authorId}`);

    const offer = await this.offerService.create(dto);

    this.logger.info(`Offer created successfully with id: ${offer.id}`);
    this.created(res, offer);
  }

  private async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = new UpdateOfferDto(req.body);

    this.logger.info(`Updating offer with id: ${id}`);

    const offer = await this.offerService.update(id, dto);

    this.logger.info(`Offer ${id} updated successfully`);
    this.ok(res, offer);
  }

  private async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    this.logger.info(`Deleting offer with id: ${id}`);

    await this.offerService.delete(id);

    this.logger.info(`Offer ${id} deleted successfully`);
    this.noContent(res);
  }

  private async premium(req: Request, res: Response): Promise<void> {
    const { city } = req.query;

    if (!city) {
      throw new BadRequestError('City parameter is required');
    }

    this.logger.info(`Fetching premium offers for city: ${city}`);

    const offers = await this.offerService.findPremium(city as string);

    this.logger.info(`Retrieved ${offers.length} premium offers for ${city}`);
    this.ok(res, offers);
  }

  private async favorites(req: Request, res: Response): Promise<void> {
    const userId = req.query.userId as string;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    this.logger.info(`Fetching favorites for user: ${userId}`);

    const offers = await this.offerService.findFavorites(userId);

    this.logger.info(`Retrieved ${offers.length} favorite offers for user ${userId}`);
    this.ok(res, offers);
  }

  private async addFavorite(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const userId = req.body.userId;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    this.logger.info(`Adding offer ${id} to favorites for user ${userId}`);

    const offer = await this.offerService.addToFavorites(id, userId);

    this.logger.info(`Offer ${id} added to favorites for user ${userId}`);
    this.ok(res, offer);
  }

  private async removeFavorite(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const userId = req.body.userId;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    this.logger.info(`Removing offer ${id} from favorites for user ${userId}`);

    const offer = await this.offerService.removeFromFavorites(id, userId);

    this.logger.info(`Offer ${id} removed from favorites for user ${userId}`);
    this.ok(res, offer);
  }
}
