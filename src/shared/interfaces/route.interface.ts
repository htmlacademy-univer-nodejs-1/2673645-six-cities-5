import { NextFunction, Request, Response } from 'express';
import { IMiddleware } from './middleware.interface.js';

export interface IRoute {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  middlewares?: IMiddleware[];
}
