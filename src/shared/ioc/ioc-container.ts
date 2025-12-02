import 'reflect-metadata';
import { Container } from 'inversify';
import { Logger } from 'pino';
import { createLogger } from '../libs/logger.js';
import { config } from '../config/config.js';
import { Application } from '../../app/application.js';
import { DatabaseConnection } from '../db/database-connection.js';
import { JwtService } from '../libs/jwt.js';
import { PasswordService } from '../libs/password.js';

import { UserRepository } from '../db/repositories/user.repository.js';
import { OfferRepository } from '../db/repositories/offer.repository.js';
import { CommentRepository } from '../db/repositories/comment.repository.js';

import { UserService } from '../services/user.service.js';
import { OfferService } from '../services/offer.service.js';
import { CommentService } from '../services/comment.service.js';

import { OfferController } from '../../app/controllers/offer.controller.js';
import { UserController } from '../../app/controllers/user.controller.js';
import { CommentController } from '../../app/controllers/comment.controller.js';

export const TYPES = {
  Logger: Symbol.for('Logger'),
  Config: Symbol.for('Config'),
  Application: Symbol.for('Application'),
  DatabaseConnection: Symbol.for('DatabaseConnection'),
  JwtService: Symbol.for('JwtService'),
  PasswordService: Symbol.for('PasswordService'),

  UserRepository: Symbol.for('UserRepository'),
  OfferRepository: Symbol.for('OfferRepository'),
  CommentRepository: Symbol.for('CommentRepository'),

  UserService: Symbol.for('UserService'),
  OfferService: Symbol.for('OfferService'),
  CommentService: Symbol.for('CommentService'),

  OfferController: Symbol.for('OfferController'),
  UserController: Symbol.for('UserController'),
  CommentController: Symbol.for('CommentController')
};

export function createContainer(): Container {
  const container = new Container();

  const appLogger = createLogger();
  container.bind<Logger>(TYPES.Logger).toConstantValue(appLogger);

  container.bind(TYPES.Config).toConstantValue(config);

  container.bind<Application>(TYPES.Application)
    .to(Application)
    .inSingletonScope();

  container.bind<DatabaseConnection>(TYPES.DatabaseConnection)
    .to(DatabaseConnection)
    .inSingletonScope();

  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  const jwtService = new JwtService(jwtSecret, appLogger);
  container.bind<JwtService>(TYPES.JwtService).toConstantValue(jwtService);

  const saltRounds = parseInt(process.env.SALT || '10', 10);
  const passwordService = new PasswordService(saltRounds, appLogger);
  container.bind<PasswordService>(TYPES.PasswordService).toConstantValue(passwordService);

  container.bind<UserRepository>(TYPES.UserRepository)
    .to(UserRepository)
    .inSingletonScope();

  container.bind<OfferRepository>(TYPES.OfferRepository)
    .to(OfferRepository)
    .inSingletonScope();

  container.bind<CommentRepository>(TYPES.CommentRepository)
    .to(CommentRepository)
    .inSingletonScope();

  container.bind<UserService>(TYPES.UserService)
    .to(UserService)
    .inSingletonScope();

  container.bind<OfferService>(TYPES.OfferService)
    .to(OfferService)
    .inSingletonScope();

  container.bind<CommentService>(TYPES.CommentService)
    .to(CommentService)
    .inSingletonScope();

  container.bind<OfferController>(TYPES.OfferController)
    .to(OfferController)
    .inSingletonScope();

  container.bind<UserController>(TYPES.UserController)
    .to(UserController)
    .inSingletonScope();

  container.bind<CommentController>(TYPES.CommentController)
    .to(CommentController)
    .inSingletonScope();

  return container;
}
