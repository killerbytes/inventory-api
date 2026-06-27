const pino = require('pino');

const isDevelopment = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      }
    : undefined,
});

module.exports = logger;
