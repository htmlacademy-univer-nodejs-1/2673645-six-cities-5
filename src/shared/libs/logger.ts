import pino, { Logger } from 'pino';

export function createLogger(): Logger {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: isDevelopment
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            levelFirst: true,
            singleLine: false,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          }
        }
      : undefined
  });

  return logger;
}

export type { Logger };