import { inject, injectable } from 'inversify';
import { Component } from '../../shared/types/index.js';
import { Logger } from '../../shared/libs/logger/index.js';

@injectable()
export class RestApplication {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
  ) {}

  public async init() {
    this.logger.info('Application initialization');
  }
}
