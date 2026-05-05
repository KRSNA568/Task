const pino = require('pino');
const { NODE_ENV } = require('../config/env');

const logger = pino(
  NODE_ENV === 'development'
    ? { transport: { target: 'pino-pretty', options: { colorize: true } }, level: 'debug' }
    : { level: 'info' }
);

module.exports = logger;
