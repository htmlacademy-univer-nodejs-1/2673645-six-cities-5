import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'pino';
import { HttpError } from '../errors/http-error.js';

export class ExceptionFilter {
  constructor(private logger: Logger) {}

  public catch(
    error: Error | HttpError,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    if (error instanceof HttpError) {
      this.logger.warn({
        statusCode: error.statusCode,
        message: error.message,
        path: req.path,
        method: req.method
      }, 'HTTP Error');

      res.status(error.statusCode).json({
        error: error.name,
        message: error.message,
        ...(error.details && { details: error.details })
      });
    } else {
      this.logger.error({
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
      }, 'Internal Server Error');

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production'
          ? 'Something went wrong'
          : error.message
      });
    }
  }
}
