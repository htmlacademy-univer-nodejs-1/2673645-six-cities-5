import { NextFunction, Response } from 'express';
import { Logger } from 'pino';
import { IMiddleware } from '../interfaces/middleware.interface.js';
import { JwtService } from '../libs/jwt.js';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface.js';

export class AuthenticateOptionalMiddleware implements IMiddleware {
  constructor(
    private jwtService: JwtService,
    private logger: Logger
  ) {}

  async execute(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      this.logger.debug('No authorization header provided (optional auth)');
      next();
      return;
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      this.logger.debug('Invalid authorization header format (optional auth)');
      next();
      return;
    }

    const [scheme, token] = parts;

    if (scheme !== 'Bearer') {
      this.logger.debug(`Invalid auth scheme: ${scheme} (optional auth)`);
      next();
      return;
    }

    if (!token) {
      this.logger.debug('No token provided (optional auth)');
      next();
      return;
    }

    try {
      const payload = await this.jwtService.verifyToken(token);

      req.user = {
        id: payload.id,
        email: payload.email,
        type: payload.type
      };

      this.logger.debug(`User authenticated: ${payload.email} (optional)`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.debug(`Token verification failed (optional auth): ${msg}`);
    }

    next();
  }
}
