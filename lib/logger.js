const pino = require('pino');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: IS_PRODUCTION ? undefined : { target: 'pino-pretty' }
});

module.exports = logger;
