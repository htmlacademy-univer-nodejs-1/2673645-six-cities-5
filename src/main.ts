import 'reflect-metadata';
import { createContainer, TYPES } from './shared/ioc/ioc-container.js';
import { Application } from './app/application.js';
import { OfferController } from './app/controllers/offer.controller.js';
import { UserController } from './app/controllers/user.controller.js';
import { CommentController } from './app/controllers/comment.controller.js';
import { Logger } from 'pino';

async function main(): Promise<void> {
  const container = createContainer();

  const app = container.get<Application>(TYPES.Application);
  const logger = container.get<Logger>(TYPES.Logger);

  const offerController = container.get<OfferController>(TYPES.OfferController);
  const userController = container.get<UserController>(TYPES.UserController);
  const commentController = container.get<CommentController>(TYPES.CommentController);

  try {
    await app.init();
    app.registerRoutes([offerController, userController, commentController]);

    const closeSignal = async () => {
      logger.info('Received close signal...');
      await app.close();
    };

    process.on('SIGTERM', closeSignal);
    process.on('SIGINT', closeSignal);
  } catch (error) {
    logger.error(error);
  }
}

main();
