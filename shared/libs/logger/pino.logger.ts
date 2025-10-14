import { Logger as PinoInstanse, pino } from 'pino';
import { Logger } from './logger.interface.js';
import { injectable } from 'inversify';

@injectable()
export class PinoLogger implements Logger {
  private readonly logger: PinoInstanse;

  constructor() {
    this.logger = pino();
  }

  public info(message: string): void {
    this.logger.info(message);
  }

  public warn(message: string): void {
    this.logger.warn(message);
  }

  public error(message: string, error: Error, ...args: unknown[]): void {
    this.logger.error(error, message, args);
  }

  public debug(message: string): void {
    this.logger.debug(message);
  }
}
