// src/app/application.ts

import { injectable, inject } from 'inversify';
import express, { Express } from 'express';
import { createServer, Server } from 'node:http';
import cors from 'cors';
import { Logger } from 'pino';
import { TYPES } from '../shared/ioc/ioc-container.js';
import { DatabaseConnection } from '../shared/db/database-connection.js';
import { IController } from '../shared/interfaces/controller.interface.js';
import { ExceptionFilter } from '../shared/middlewares/exception-filter.middleware.js';

@injectable()
export class Application {
  private server: Server | null = null;
  private app: Express;

  constructor(
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.Config) private config: unknown,
    @inject(TYPES.DatabaseConnection) private db: DatabaseConnection
  ) {
    this.app = express();
  }

  public async init(): Promise<void> {
    this.logger.info('Application initialization...');

    await this.initDb();
    this.initMiddlewares();
    this.initExceptionFilters();
    await this.initServer();

    this.logger.info('Application initialized');
  }

  private async initDb(): Promise<void> {
    this.logger.info('Database initialization...');

    const dbHost = process.env.DB_HOST || '127.0.0.1';
    const dbPort = parseInt(process.env.DB_PORT || '27017', 10);
    const dbName = process.env.DB_NAME || 'six-cities';
    const dbUser = process.env.DB_USER || '';
    const dbPassword = process.env.DB_PASSWORD || '';

    let uri: string;
    if (dbUser && dbPassword) {
      uri = `mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?authSource=admin`;
    } else {
      uri = `mongodb://${dbHost}:${dbPort}/${dbName}`;
    }

    this.logger.info(`Connecting to database: ${uri.replace(/:[^:/@]+@/, ':****@')}`);
    await this.db.connect(uri);
    this.logger.info('Database initialized');
  }

  private initMiddlewares(): void {
    this.logger.info('Middlewares initialization...');

    // CORS middleware
    const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
    this.app.use(cors({
      origin: corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Body parser middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Static files
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.app.use('/uploads', express.static(uploadDir));

    this.logger.info('Middlewares initialized');
  }

  private initExceptionFilters(): void {
    this.logger.info('Exception filters initialization...');
    const exceptionFilter = new ExceptionFilter(this.logger);
    this.app.use(exceptionFilter.catch.bind(exceptionFilter));
    this.logger.info('Exception filters initialized');
  }

  public registerRoutes(controllers: IController[]): void {
    this.logger.info('Routes registration...');
    controllers.forEach((controller) => {
      this.app.use('/api', controller.router);
    });
    this.logger.info(`Routes registered: ${controllers.length} controllers`);
  }

  private async initServer(): Promise<void> {
    const port = parseInt(process.env.PORT || '3000', 10);

    this.server = createServer(this.app);

    this.server.listen(port, () => {
      this.logger.info(`Server started on http://localhost:${port}`);
    });
  }

  public async close(): Promise<void> {
    this.logger.info('Application shutdown...');

    if (this.server) {
      this.server.close();
    }

    await this.db.disconnect();
    this.logger.info('Application closed');
  }
}
