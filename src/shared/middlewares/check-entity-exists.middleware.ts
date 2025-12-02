import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'pino';
import { IMiddleware } from '../interfaces/middleware.interface.js';
import { IEntityService } from '../interfaces/entity-service.interface.js';

export class CheckEntityExistsMiddleware implements IMiddleware {
  constructor(
    private service: IEntityService,
    private paramName: string = 'id',
    private entityName: string = 'Entity',
    private logger: Logger
  ) {}

  async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = req.params[this.paramName];

    try {
      this.logger.debug(`Checking if ${this.entityName} with id ${id} exists`);

      const entity = await this.service.findById(id);

      if (!entity) {
        this.logger.warn(`${this.entityName} with id ${id} not found`);
        res.status(StatusCodes.NOT_FOUND).json({
          error: 'Not Found',
          message: `${this.entityName} with id ${id} not found`
        });
        return;
      }

      (req as any).entity = entity;

      this.logger.debug(`${this.entityName} with id ${id} found`);
      next();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error checking entity existence: ${msg}`);

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Failed to verify entity'
      });
    }
  }
}
