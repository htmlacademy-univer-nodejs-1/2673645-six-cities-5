import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { Logger } from 'pino';
import { BaseController } from '../../shared/controllers/base.controller.js';
import { TYPES } from '../../shared/ioc/ioc-container.js';
import { OfferService } from '../../shared/services/offer.service.js';
import { CreateOfferDto } from '../../shared/dto/offer/create-offer.dto.js';
import { UpdateOfferDto } from '../../shared/dto/offer/update-offer.dto.js';
import { NotFoundError, BadRequestError } from '../../shared/errors/http-error.js';

@injectable()
export class OfferController extends BaseController {
  constructor(
    @inject(TYPES.Logger) logger: Logger,
    @inject(TYPES.OfferService) private offerService: OfferService
  ) {
    super(logger);
  }

  protected initializeRoutes(): void {
    this.addRoute({
      path: '/offers',
      method: 'get',
      handler: this.getOffers
    });

    this.addRoute({
      path: '/offers/premium',
      method: 'get',
      handler: this.getPremiumOffers
    });

    this.addRoute({
      path: '/offers/favorites',
      method: 'get',
      handler: this.getFavorites
    });

    this.addRoute({
      path: '/offers/:id',
      method: 'get',
      handler: this.getOfferById
    });

    this.addRoute({
      path: '/offers',
      method: 'post',
      handler: this.createOffer
    });

    this.addRoute({
      path: '/offers/:id',
      method: 'patch',
      handler: this.updateOffer
    });

    this.addRoute({
      path: '/offers/:id',
      method: 'delete',
      handler: this.deleteOffer
    });

    this.addRoute({
      path: '/offers/:id/favorite',
      method: 'post',
      handler: this.addToFavorites
    });

    this.addRoute({
      path: '/offers/:id/favorite',
      method: 'delete',
      handler: this.removeFromFavorites
    });
  }

  private async getOffers(req: Request, res: Response): Promise<void> {
    const { city, limit } = req.query;
    const offers = city
      ? await this.offerService.findByCity(city as string, Number(limit) || 60)
      : await this.offerService.findAll(Number(limit) || 60);

    this.logger.info(`Retrieved ${offers.length} offers`);
    this.ok(res, offers);
  }

  private async getOfferById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    this.logger.info(`Fetching offer with id: ${id}`);
    const offer = await this.offerService.findById(id);
    if (!offer) {
      throw new NotFoundError(`Offer with id ${id} not found`);
    }

    this.ok(res, offer);
  }

  private async createOffer(req: Request, res: Response): Promise<void> {
    const dto = new CreateOfferDto(req.body);
    dto.authorId = req.body.authorId;

    if (!dto.authorId) {
      throw new BadRequestError('Author ID is required');
    }

    this.logger.info(`Creating new offer: ${dto.title}`);
    const offer = await this.offerService.create(dto);
    this.created(res, offer);
  }

  private async updateOffer(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = new UpdateOfferDto(req.body);

    this.logger.info(`Updating offer with id: ${id}`);

    const offer = await this.offerService.update(id, dto);
    if (!offer) {
      throw new NotFoundError(`Offer with id ${id} not found`);
    }

    this.ok(res, offer);
  }

  private async deleteOffer(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    this.logger.info(`Deleting offer with id: ${id}`);

    const deleted = await this.offerService.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Offer with id ${id} not found`);
    }

    this.noContent(res);
  }

  private async getPremiumOffers(req: Request, res: Response): Promise<void> {
    const { city } = req.query;

    if (!city) {
      throw new BadRequestError('City parameter is required');
    }

    this.logger.info(`Fetching premium offers for city: ${city}`);

    const offers = await this.offerService.findPremium(city as string);
    this.ok(res, offers);
  }

  private async getFavorites(req: Request, res: Response): Promise<void> {
    const userId = req.query.userId as string;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    this.logger.info(`Fetching favorites for user: ${userId}`);

    const offers = await this.offerService.findFavorites(userId);
    this.ok(res, offers);
  }

  private async addToFavorites(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.body.userId;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    this.logger.info(`Adding offer ${id} to favorites for user ${userId}`);

    const offer = await this.offerService.addToFavorites(id, userId);
    if (!offer) {
      throw new NotFoundError(`Offer with id ${id} not found`);
    }

    this.ok(res, offer);
  }

  private async removeFromFavorites(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.body.userId;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    this.logger.info(`Removing offer ${id} from favorites for user ${userId}`);

    const offer = await this.offerService.removeFromFavorites(id, userId);
    if (!offer) {
      throw new NotFoundError(`Offer with id ${id} not found`);
    }

    this.ok(res, offer);
  }
}
