import 'reflect-metadata';
import { createContainer, TYPES } from './shared/ioc/ioc-container.js';
import { Application } from './app/application.js';

async function bootstrap() {
  try {
    const container = createContainer();
    const app = container.get<Application>(TYPES.Application);
    await app.start();
  } catch (error) {
    console.error('Failed to start application:', error);
  }
}

bootstrap();
