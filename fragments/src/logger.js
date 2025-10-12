const pino = require('pino');

const options = { level: process.env.LOG_LEVEL || 'info' };

/* istanbul ignore next */
if (options.level === 'debug') {
  options.transport = {
    target: 'pino-pretty',
    options: { colorize: true },
  };
}

module.exports = pino(options);
