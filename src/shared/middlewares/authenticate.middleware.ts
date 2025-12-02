// src/shared/middlewares/authenticate.middleware.ts

import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'pino';
import { IMiddleware } from '../interfaces/middleware.interface.js';
import { JwtService } from '../libs/jwt.js';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface.js';

export class AuthenticateMiddleware implements IMiddleware {
  constructor(
    private jwtService: JwtService,
    private logger: Logger
  ) {}

  async execute(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      this.logger.warn('Missing authorization header');
      res.status(StatusCodes.UNAUTHORIZED).json({
        error: 'Unauthorized',
        message: 'Authorization header is missing'
      });
      return;
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      this.logger.warn('Invalid authorization header format');
      res.status(StatusCodes.UNAUTHORIZED).json({
        error: 'Unauthorized',
        message: 'Invalid authorization header format'
      });
      return;
    }

    try {
      const payload = await this.jwtService.verifyToken(token);

      req.user = {
        id: payload.id,
        email: payload.email,
        type: payload.type
      };

      this.logger.debug(`User authenticated: ${payload.email}`);
      next();
      return;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Token verification failed: ${msg}`);

      res.status(StatusCodes.UNAUTHORIZED).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });

    }
  }
}
