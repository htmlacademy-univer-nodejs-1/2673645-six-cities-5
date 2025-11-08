import 'reflect-metadata';
import { createContainer, TYPES } from './shared/ioc/ioc-container.js';
import { Application } from './app/application.js';
import { OfferController } from './app/controllers/offer.controller.js';
import { UserController } from './app/controllers/user.controller.js';

async function bootstrap() {
  try {
    const container = createContainer();

    const offerController = container.get<OfferController>(TYPES.OfferController);
    const userController = container.get<UserController>(TYPES.UserController);

    const controllers = [offerController, userController];

    const app = container.get<Application>(TYPES.Application);
    await app.init(controllers);
    await app.start();
  } catch (error) {
    console.error('Failed to start application:', error);
  }
}

bootstrap();
