// jest.config.js
const path = require('path');

// make sure guards like NODE_ENV !== 'test' work
process.env.NODE_ENV = 'test';

const envFile = path.join(__dirname, 'env.jest');
require('dotenv').config({ path: envFile });

console.log(`Using LOG_LEVEL=${process.env.LOG_LEVEL}. Use 'debug' in env.jest for more detail`);

module.exports = {
  verbose: true,
  testTimeout: 5000,
};