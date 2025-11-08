import { NextFunction, Request, Response } from 'express';

export interface IRoute {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  middleware?: Array<(req: Request, res: Response, next: NextFunction) => void>;
}
