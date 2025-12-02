import 'reflect-metadata';
import { Container } from 'inversify';
import { Logger } from 'pino';
import { createLogger } from '../libs/logger.js';
import { config } from '../config/config.js';
import { Application } from '../../app/application.js';
import { DatabaseConnection } from '../db/database-connection.js';
import { UserRepository } from '../db/repositories/user.repository.js';
import { OfferRepository } from '../db/repositories/offer.repository.js';
import { CommentRepository } from '../db/repositories/comment.repository.js';
import { CommentService } from '../services/comment.service.js';
import { CommentController } from '../../app/controllers/comment.controller.js';
import { OfferService } from '../services/offer.service.js';
import { OfferController } from '../../app/controllers/offer.controller.js';
import { UserController } from '../../app/controllers/user.controller.js';
import { UserService } from '../services/user.service.js';

export const TYPES = {
  Logger: Symbol.for('Logger'),
  Config: Symbol.for('Config'),
  Application: Symbol.for('Application'),
  DatabaseConnection: Symbol.for('DatabaseConnection'),
  UserRepository: Symbol.for('UserRepository'),
  OfferRepository: Symbol.for('OfferRepository'),
  CommentRepository: Symbol.for('CommentRepository'),
  CommentService: Symbol.for('CommentService'),
  OfferService: Symbol.for('OfferService'),
  UserService: Symbol.for('UserService'),
  OfferController: Symbol.for('OfferController'),
  UserController: Symbol.for('UserController'),
  CommentController: Symbol.for('CommentController')
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
  container.bind<CommentRepository>(TYPES.CommentRepository)
    .to(CommentRepository).inSingletonScope();
  container.bind<CommentService>(TYPES.CommentService)
    .to(CommentService).inSingletonScope();
  container.bind<OfferService>(TYPES.OfferService)
    .to(OfferService).inSingletonScope();
  container.bind<UserService>(TYPES.UserService)
    .to(UserService).inSingletonScope();
  container.bind<OfferController>(TYPES.OfferController)
    .to(OfferController).inSingletonScope();
  container.bind<UserController>(TYPES.UserController)
    .to(UserController).inSingletonScope();
  container.bind<CommentController>(TYPES.CommentController)
    .to(CommentController).inSingletonScope();

  return container;
}
