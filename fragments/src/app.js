// src/app.js
if (process.env.NODE_ENV !== 'test') {
  require('dotenv').config();
}

const express = require('express');
const passport = require('passport');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const authenticate = require('./auth'); // exports { strategy, authenticate }
const logger = require('./logger');
const pino = require('pino-http')({ logger });

const app = express();

app.use(pino);
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

passport.use(authenticate.strategy());
app.use(passport.initialize());

app.use('/', require('./routes'));

// 404
app.use((req, res) => {
  res.status(404).json({ status: 'error', error: { message: 'not found', code: 404 } });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';
  if (status > 499) logger.error({ err }, 'Error processing request');
  res.status(status).json({ status: 'error', error: { message, code: status } });
});

if (process.env.LOG_LEVEL === 'debug') {
  logger.debug({ env: process.env }, 'process.env (debug mode)');
}

module.exports = app;
