import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Logger } from 'pino';
import { TYPES } from '../shared/ioc/ioc-container.js';

@injectable()
export class Application {
  constructor(
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.Config) private config: any
  ) {}

  async init(): Promise<void> {
    this.logger.info('Application initialized');
    
    const port = this.config.get('port');
    const env = this.config.get('env');
    const dbHost = this.config.get('db.host');
    const dbPort = this.config.get('db.port');
    const dbName = this.config.get('db.name');
    
    this.logger.info(`Server port: ${port}`);
    this.logger.info(`Environment: ${env}`);
    this.logger.info(`Database: ${dbHost}:${dbPort} (${dbName})`);
  }

  async start(): Promise<void> {
    await this.init();
    
    const port = this.config.get('port');
    this.logger.info(`Starting server on port ${port}...`);
  }

  async stop(): Promise<void> {
    this.logger.info('Application stopped');
  }
}
