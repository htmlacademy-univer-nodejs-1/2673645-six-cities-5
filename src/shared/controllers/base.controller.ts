import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'pino';
import asyncHandler from 'express-async-handler';
import { IController } from '../interfaces/controller.interface.js';
import { IRoute } from '../interfaces/route.interface.js';

export abstract class BaseController implements IController {
  public readonly router: Router;

  constructor(protected logger: Logger) {
    this.router = Router();
    this.initializeRoutes();
  }

  protected abstract initializeRoutes(): void;

  protected addRoute(route: IRoute): void {
    const middleware = route.middleware || [];
    const handler = asyncHandler(route.handler.bind(this));

    this.router[route.method](route.path, ...middleware, handler);
  }

  protected ok<T>(res: Response, data?: T): void {
    if (data) {
      res.status(StatusCodes.OK).json(data);
    } else {
      res.sendStatus(StatusCodes.OK);
    }
  }

  protected created<T>(res: Response, data?: T): void {
    if (data) {
      res.status(StatusCodes.CREATED).json(data);
    } else {
      res.sendStatus(StatusCodes.CREATED);
    }
  }

  protected noContent(res: Response): void {
    res.sendStatus(StatusCodes.NO_CONTENT);
  }

  protected badRequest(res: Response, message: string): void {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Bad Request',
      message
    });
  }

  protected unauthorized(res: Response, message = 'Unauthorized'): void {
    res.status(StatusCodes.UNAUTHORIZED).json({
      error: 'Unauthorized',
      message
    });
  }

  protected forbidden(res: Response, message = 'Forbidden'): void {
    res.status(StatusCodes.FORBIDDEN).json({
      error: 'Forbidden',
      message
    });
  }

  protected notFound(res: Response, message = 'Not found'): void {
    res.status(StatusCodes.NOT_FOUND).json({
      error: 'Not Found',
      message
    });
  }

  protected conflict(res: Response, message: string): void {
    res.status(StatusCodes.CONFLICT).json({
      error: 'Conflict',
      message
    });
  }
}
