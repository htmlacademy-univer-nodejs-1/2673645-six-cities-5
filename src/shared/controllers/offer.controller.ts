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
      path: '/offers/premium',
      method: 'get',
      handler: this.getPremiumOffers
    });
  }

  private async getOffers(req: Request, res: Response): Promise<void> {
    const { city, limit } = req.query;
    const offers = city
      ? await this.offerService.findByCity(city as string, Number(limit) || 60)
      : await this.offerService.findAll(Number(limit) || 60);

    this.ok(res, offers);
  }

  private async getOfferById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const offer = await this.offerService.findById(id);
    if (!offer) {
      throw new NotFoundError('Offer not found');
    }

    this.ok(res, offer);
  }

  private async createOffer(req: Request, res: Response): Promise<void> {
    const dto = new CreateOfferDto(req.body);
    dto.authorId = req.body.authorId;

    const offer = await this.offerService.create(dto);
    this.created(res, offer);
  }

  private async updateOffer(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = new UpdateOfferDto(req.body);

    const offer = await this.offerService.update(id, dto);
    if (!offer) {
      throw new NotFoundError('Offer not found');
    }

    this.ok(res, offer);
  }

  private async deleteOffer(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const deleted = await this.offerService.delete(id);
    if (!deleted) {
      throw new NotFoundError('Offer not found');
    }

    this.noContent(res);
  }

  private async getPremiumOffers(req: Request, res: Response): Promise<void> {
    const { city } = req.query;

    if (!city) {
      throw new BadRequestError('City parameter is required');
    }

    const offers = await this.offerService.findPremium(city as string);
    this.ok(res, offers);
  }
}
