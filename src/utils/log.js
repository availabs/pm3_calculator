const bunyan = require('bunyan');

const level = process.env.LOG_LEVEL || 'error';

const log = bunyan.createLogger({
  name: 'pm3_calculator',
  stream: process.stderr,
  level
});

module.exports = log;
