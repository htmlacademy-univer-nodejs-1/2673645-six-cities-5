import 'reflect-metadata';
import { Container } from 'inversify';
import { Logger } from 'pino';
import { createLogger } from '../libs/logger.js';
import { config } from '../config/config.js';
import { Application } from '../../app/application.js';

export const TYPES = {
  Logger: Symbol.for('Logger'),
  Config: Symbol.for('Config'),
  Application: Symbol.for('Application'),
  
  UserService: Symbol.for('UserService'),
  OfferService: Symbol.for('OfferService'),
  AuthService: Symbol.for('AuthService'),
  CommentService: Symbol.for('CommentService'),
  
  UserRepository: Symbol.for('UserRepository'),
  OfferRepository: Symbol.for('OfferRepository'),
  CommentRepository: Symbol.for('CommentRepository')
};

export function createContainer(): Container {
  const container = new Container();

  const logger = createLogger();
  container.bind<Logger>(TYPES.Logger).toConstantValue(logger);

  container.bind(TYPES.Config).toConstantValue(config);

  container.bind<Application>(TYPES.Application).to(Application).inSingletonScope();

  return container;
}
