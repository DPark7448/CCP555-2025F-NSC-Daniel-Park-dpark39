// src/logger.js
const pino = require('pino');

// Use `info` unless LOG_LEVEL is set
const options = { level: process.env.LOG_LEVEL || 'info' };

// Pretty-print only in debug
if (options.level === 'debug') {
  options.transport = {
    target: 'pino-pretty',
    options: { colorize: true },
  };
}

const logger = pino(options); 

module.exports = logger; 
