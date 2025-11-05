import 'reflect-metadata';
import { Container } from 'inversify';
import { Logger } from 'pino';
import { createLogger } from '../libs/logger.js';
import { config } from '../config/config.js';
import { Application } from '../../app/application.js';
import { DatabaseConnection } from '../db/database-connection.js';
import { UserRepository } from '../db/repositories/user.repository.js';
import { OfferRepository } from '../db/repositories/offer.repository.js';

export const TYPES = {
  Logger: Symbol.for('Logger'),
  Config: Symbol.for('Config'),
  Application: Symbol.for('Application'),
  DatabaseConnection: Symbol.for('DatabaseConnection'),
  UserRepository: Symbol.for('UserRepository'),
  OfferRepository: Symbol.for('OfferRepository')
};

export function createContainer(): Container {
  const container = new Container();

  const logger = createLogger();
  container.bind<Logger>(TYPES.Logger).toConstantValue(logger);
  container.bind(TYPES.Config).toConstantValue(config);

  container.bind<DatabaseConnection>(TYPES.DatabaseConnection)
    .to(DatabaseConnection).inSingletonScope();
  
  container.bind<UserRepository>(TYPES.UserRepository)
    .to(UserRepository).inSingletonScope();
  
  container.bind<OfferRepository>(TYPES.OfferRepository)
    .to(OfferRepository).inSingletonScope();

  container.bind<Application>(TYPES.Application).to(Application).inSingletonScope();

  return container;
}
