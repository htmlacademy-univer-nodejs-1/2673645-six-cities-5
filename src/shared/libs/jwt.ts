import { SignJWT, jwtVerify } from 'jose';
import { Logger } from 'pino';
import { IUser } from '../db/models/user.schema.js';

export interface TokenPayload {
  id: string;
  email: string;
  type: string;
  iat?: number;
  exp?: number;
}

export class JwtService {
  private secret: Uint8Array;

  constructor(
    private secretKey: string,
    private logger: Logger
  ) {
    this.secret = new TextEncoder().encode(secretKey);
  }

  async generateToken(user: IUser, expirationTime = '24h'): Promise<string> {
    try {
      const iat = Math.floor(Date.now() / 1000);
      const exp = this.getExpirationTime(expirationTime, iat);

      const token = await new SignJWT({
        id: user.id.toString(),
        email: user.email,
        type: user.type
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(iat)
        .setExpirationTime(exp)
        .sign(this.secret);

      this.logger.debug(`Token generated for user: ${user.email}`);
      return token;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error generating token: ${msg}`);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const { payload } = await jwtVerify(token, this.secret);

      return {
        id: payload.id as string,
        email: payload.email as string,
        type: payload.type as string,
        iat: payload.iat,
        exp: payload.exp
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error verifying token: ${msg}`);
      throw error;
    }
  }

  private getExpirationTime(expirationTime: string, iat: number): number {
    const match = expirationTime.match(/^(\d+)([hdms])$/);
    if (!match) {
      throw new Error('Invalid expiration time format');
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    let seconds = 0;
    switch (unit) {
      case 'h':
        seconds = value * 3600;
        break;
      case 'd':
        seconds = value * 86400;
        break;
      case 'm':
        seconds = value * 60;
        break;
      case 's':
        seconds = value;
        break;
    }

    return iat + seconds;
  }
}
