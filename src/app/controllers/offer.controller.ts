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
import { AuthenticateMiddleware } from '../../shared/middlewares/authenticate.middleware.js';
import { AuthenticateOptionalMiddleware } from '../../shared/middlewares/authenticate-optional.middleware.js'; // ← Добавьте эту строку
import { JwtService } from '../../shared/libs/jwt.js';
import { AuthenticatedRequest } from '../../shared/interfaces/authenticated-request.interface.js';
import { BadRequestError, ForbiddenError, UnauthorizedError } from '../../shared/errors/http-error.js';

@injectable()
export class OfferController extends BaseController {
  constructor(
    @inject(TYPES.Logger) logger: Logger,
    @inject(TYPES.OfferService) private offerService: OfferService,
    @inject(TYPES.JwtService) private jwtService: JwtService
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
    const authenticate = new AuthenticateMiddleware(this.jwtService, this.logger);
    const authenticateOptional = new AuthenticateOptionalMiddleware(this.jwtService, this.logger);

    this.addRoute({
      path: '/offers',
      method: 'get',
      middlewares: [authenticateOptional],
      handler: this.index
    });

    this.addRoute({
      path: '/offers/premium',
      method: 'get',
      middlewares: [authenticateOptional],
      handler: this.premium
    });

    this.addRoute({
      path: '/offers/favorites',
      method: 'get',
      middlewares: [authenticate],
      handler: this.favorites
    });

    this.addRoute({
      path: '/offers/:id',
      method: 'get',
      middlewares: [validateObjectId, checkOfferExists, authenticateOptional],
      handler: this.show
    });

    this.addRoute({
      path: '/offers',
      method: 'post',
      middlewares: [authenticate, validateCreateOffer],
      handler: this.create
    });

    this.addRoute({
      path: '/offers/:id',
      method: 'patch',
      middlewares: [authenticate, validateObjectId, checkOfferExists, validateUpdateOffer],
      handler: this.update
    });

    this.addRoute({
      path: '/offers/:id',
      method: 'delete',
      middlewares: [authenticate, validateObjectId, checkOfferExists],
      handler: this.delete
    });

    this.addRoute({
      path: '/offers/:id/favorite',
      method: 'post',
      middlewares: [authenticate, validateObjectId, checkOfferExists],
      handler: this.addFavorite
    });

    this.addRoute({
      path: '/offers/:id/favorite',
      method: 'delete',
      middlewares: [authenticate, validateObjectId, checkOfferExists],
      handler: this.removeFavorite
    });
  }

  private async index(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { city, limit } = req.query;
    const userId = req.user?.id;

    this.logger.info(`Fetching offers with params: city=${city || 'all'}, userId=${userId || 'anonymous'}`);

    const offers = city
      ? await this.offerService.findByCity(city as string, Number(limit) || 60, userId)
      : await this.offerService.findAll(Number(limit) || 60, userId);

    this.logger.info(`Retrieved ${offers.length} offers`);
    this.ok(res, offers);
  }

  private async show(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const offer = (req as any).entity;

    this.logger.info(`Offer ${id} retrieved successfully`);
    this.ok(res, offer);
  }

  private async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const dto = new CreateOfferDto(req.body);
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError('Authentication required');
    }

    dto.authorId = userId;

    this.logger.info(`Creating new offer: ${dto.title} by author ${userId}`);

    const offer = await this.offerService.create(dto);

    this.logger.info(`Offer created successfully with id: ${offer.id}`);
    this.created(res, offer);
  }

  private async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = new UpdateOfferDto(req.body);
    const userId = req.user?.id;
    const existingOffer = (req as any).entity;

    if (!userId) {
      throw new UnauthorizedError('Authentication required');
    }

    if (existingOffer.author._id.toString() !== userId) {
      this.logger.warn(`User ${userId} tried to update offer by user ${existingOffer.author._id}`);
      throw new ForbiddenError('You can only update your own offers');
    }

    this.logger.info(`Updating offer with id: ${id}`);

    const offer = await this.offerService.update(id, dto);

    this.logger.info(`Offer ${id} updated successfully`);
    this.ok(res, offer);
  }

  private async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?.id;
    const existingOffer = (req as any).entity;

    if (!userId) {
      throw new UnauthorizedError('Authentication required');
    }

    if (existingOffer.author._id.toString() !== userId) {
      this.logger.warn(`User ${userId} tried to delete offer by user ${existingOffer.author._id}`);
      throw new ForbiddenError('You can only delete your own offers');
    }

    this.logger.info(`Deleting offer with id: ${id}`);

    await this.offerService.delete(id);

    this.logger.info(`Offer ${id} deleted successfully`);
    this.noContent(res);
  }

  private async premium(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { city } = req.query;
    const userId = req.user?.id;

    if (!city) {
      throw new BadRequestError('City parameter is required');
    }

    this.logger.info(`Fetching premium offers for city: ${city}`);

    const offers = await this.offerService.findPremium(city as string, userId);

    this.logger.info(`Retrieved ${offers.length} premium offers for ${city}`);
    this.ok(res, offers);
  }

  private async favorites(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError('Authentication required');
    }

    this.logger.info(`Fetching favorites for user: ${userId}`);

    const offers = await this.offerService.findFavorites(userId);

    this.logger.info(`Retrieved ${offers.length} favorite offers for user ${userId}`);
    this.ok(res, offers);
  }

  private async addFavorite(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError('Authentication required');
    }

    this.logger.info(`Adding offer ${id} to favorites for user ${userId}`);

    const offer = await this.offerService.addToFavorites(id, userId);

    this.logger.info(`Offer ${id} added to favorites`);
    this.ok(res, offer);
  }

  private async removeFavorite(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError('Authentication required');
    }

    this.logger.info(`Removing offer ${id} from favorites for user ${userId}`);

    const offer = await this.offerService.removeFromFavorites(id, userId);

    this.logger.info(`Offer ${id} removed from favorites`);
    this.ok(res, offer);
  }
}
