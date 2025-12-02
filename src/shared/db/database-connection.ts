
import { injectable } from 'inversify';
import mongoose from 'mongoose';
import { Logger } from 'pino';
import { inject } from 'inversify';
import { TYPES } from '../ioc/ioc-container.js';

export interface DatabaseConnectionOptions {
  uri?: string;
}

@injectable()
export class DatabaseConnection {
  private isConnected = false;

  constructor(@inject(TYPES.Logger) private logger: Logger) {}

  async connect(uri: string): Promise<void> {
    if (this.isConnected) {
      this.logger.info('Already connected to database');
      return;
    }

    try {
      this.logger.info(`Connecting to database: ${uri.replace(/:[^:/@]+@/, ':****@')}`);

      await mongoose.connect(uri);

      this.isConnected = true;
      this.logger.info('Database connection established');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Database connection error: ${msg}`);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      this.logger.info('Not connected to database');
      return;
    }

    try {
      this.logger.info('Disconnecting from database...');

      await mongoose.disconnect();

      this.isConnected = false;
      this.logger.info('Database connection closed');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Database disconnection error: ${msg}`);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}
