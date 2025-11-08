import mongoose from 'mongoose';
import { Logger } from 'pino';

export interface DatabaseConnectionOptions {
  host: string;
  port: number;
  name: string;
  user?: string;
  password?: string;
}

export class DatabaseConnection {
  constructor(private logger: Logger) {}

  private buildConnectionUri(options: DatabaseConnectionOptions): string {
    const auth = options.user && options.password
      ? `${options.user}:${options.password}@`
      : '';
    return `mongodb://${auth}${options.host}:${options.port}/${options.name}`;
  }

  async connect(options: DatabaseConnectionOptions): Promise<void> {
    try {
      const uri = this.buildConnectionUri(options);
      this.logger.info('Attempting to connect to MongoDB...');

      await mongoose.connect(uri, {
        maxPoolSize: 10,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000
      });

      this.logger.info('Successfully connected to MongoDB');
      this.logger.info(`Database: ${options.name} | Host: ${options.host}:${options.port}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to connect to MongoDB: ${msg}`);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      this.logger.info('Disconnected from MongoDB');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Disconnect error: ${msg}`);
      throw error;
    }
  }

  isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }
}
