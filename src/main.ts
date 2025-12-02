import 'reflect-metadata';
import { createContainer, TYPES } from './shared/ioc/ioc-container.js';
import { Application } from './app/application.js';
import { OfferController } from './app/controllers/offer.controller.js';
import { UserController } from './app/controllers/user.controller.js';
import { CommentController } from './app/controllers/comment.controller.js';
import { Logger } from 'pino';

async function bootstrap() {
  try {
    const container = createContainer();

    const logger = container.get<Logger>(TYPES.Logger);

    logger.info('Starting Six Cities API application...');
    logger.info(`Environment: ${ process.env.NODE_ENV || 'development'}`);

    const offerController = container.get<OfferController>(TYPES.OfferController);
    const userController = container.get<UserController>(TYPES.UserController);
    const commentController = container.get<CommentController>(TYPES.CommentController);

    const controllers = [
      offerController,
      userController,
      commentController
    ];

    logger.info(`Registered ${controllers.length} controllers`);

    const app = container.get<Application>(TYPES.Application);

    await app.init(controllers);

    await app.start();

    logger.info('✓ Application started successfully');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';

    console.error('✗ Failed to start application:');
    console.error(`  Error: ${errorMessage}`);

    if (errorStack) {
      console.error('  Stack trace:');
      console.error(errorStack);
    }
  }
}

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error.message);
  console.error(error.stack);
});

process.on('unhandledRejection', (reason: any) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT signal. Shutting down gracefully...');

  try {
    const container = createContainer();
    const app = container.get<Application>(TYPES.Application);
    await app.stop();
    console.log('✓ Application stopped successfully');
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM signal. Shutting down gracefully...');

  try {
    const container = createContainer();
    const app = container.get<Application>(TYPES.Application);
    await app.stop();
    console.log('✓ Application stopped successfully');
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
});

bootstrap();
