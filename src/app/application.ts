import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Logger } from 'pino';
import express, { Express } from 'express';
import { Server } from 'http';
import { TYPES } from '../shared/ioc/ioc-container.js';
import { DatabaseConnection } from '../shared/db/database-connection.js';
import { IController } from '../shared/interfaces/controller.interface.js';
import { ExceptionFilter } from '../shared/middlewares/exception-filter.middleware.js';

@injectable()
export class Application {
  private app: Express;
  private server: Server | null = null;

  constructor(
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.Config) private config: any,
    @inject(TYPES.DatabaseConnection) private db: DatabaseConnection
  ) {
    this.app = express();
  }

  private initMiddleware(): void {
    this.app.use(express.json());
    const uploadDir = this.config.get('uploadDir');
    this.app.use('/uploads', express.static(uploadDir));
    this.logger.info(`✓ Static files directory: ${uploadDir}`);

    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
    });

    this.logger.info('✓ Middleware initialized');
  }

  private initControllers(controllers: IController[]): void {
    controllers.forEach((controller) => {
      this.app.use('/api', controller.router);
      this.logger.info(`✓ Controller registered: ${controller.constructor.name}`);
    });
  }

  private initExceptionFilters(): void {
    const exceptionFilter = new ExceptionFilter(this.logger);
    this.app.use(exceptionFilter.catch.bind(exceptionFilter));
    this.logger.info('✓ Exception filter registered');
  }

  async init(controllers: IController[]): Promise<void> {
    this.logger.info('Application initialization...');

    await this.db.connect({
      host: this.config.get('db.host'),
      port: this.config.get('db.port'),
      name: this.config.get('db.name'),
      user: this.config.get('db.user'),
      password: this.config.get('db.password')
    });

    this.initMiddleware();

    this.initControllers(controllers);

    this.initExceptionFilters();

    this.logger.info('✓ Application initialized');
  }

  async start(): Promise<void> {
    const port = this.config.get('port');

    this.server = this.app.listen(port, () => {
      this.logger.info(`🚀 Server started on http://localhost:${port}`);
      this.logger.info(`📁 Upload directory: ${this.config.get('uploadDir')}`);
    });
  }

  async stop(): Promise<void> {
    if (this.server) {
      this.server.close();
      await this.db.disconnect();
      this.logger.info('Application stopped');
    }
  }
}
