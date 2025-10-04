import { inject, injectable } from 'inversify';
import { Logger } from '../../shared/libs/logger/index.js';
import { Component } from '../../shared/types/index.js';

@injectable()
export class RestApplication {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
  ) {}

  public async init() {
    this.logger.info('Application initialization');
  }
}
