// src/logger.js
const pino = require('pino');

// Default to 'info' unless LOG_LEVEL is set
const options = { level: process.env.LOG_LEVEL || 'info' };

/* istanbul ignore next */
// Pretty-print only when explicitly in debug (hard to hit in unit tests)
if (options.level === 'debug') {
  options.transport = {
    target: 'pino-pretty',
    options: { colorize: true },
  };
}

module.exports = pino(options);
