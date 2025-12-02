import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { IMiddleware } from '../interfaces/middleware.interface.js';
import { Logger } from 'pino';

export class ValidateDtoMiddleware implements IMiddleware {
  constructor(
    private dtoClass: new (...args: any[]) => object,
    private logger: Logger
  ) {}

  async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    const instance = plainToInstance(this.dtoClass, req.body);
    const errors = await validate(instance);

    if (errors.length > 0) {
      const errorMessages = this.formatValidationErrors(errors);

      this.logger.warn({
        errors: errorMessages,
        path: req.path,
        method: req.method
      }, 'Validation error');

      res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Bad Request',
        message: 'Validation failed',
        details: errorMessages
      });
      return;
    }

    next();
  }

  private formatValidationErrors(errors: ValidationError[]): object {
    return errors.reduce((acc, error) => ({
      ...acc,
      [error.property]: Object.values(error.constraints || {})
    }), {});
  }
}
