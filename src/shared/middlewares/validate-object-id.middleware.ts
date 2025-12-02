import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { IMiddleware } from '../interfaces/middleware.interface.js';

export class ValidateObjectIdMiddleware implements IMiddleware {
  constructor(private paramName: string = 'id') {}

  execute(req: Request, res: Response, next: NextFunction): void {
    const id = req.params[this.paramName];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Bad Request',
        message: `Invalid ${this.paramName} format`
      });
      return;
    }

    next();
  }
}
