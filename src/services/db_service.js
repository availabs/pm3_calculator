const path = require('path');
const { Pool } = require('pg');
const envFile = require('node-env-file');

envFile(path.join(__dirname, '../../config/postgres.env'));

const pool = new Pool();

const connectionInfo = {
  PGHOST: process.env.PGHOST,
  PGPORT: process.env.PGPORT,
  PGUSER: process.env.PGUSER,
  PGHOSTADDR: process.env.PGHOSTADDR,
  PGDATABASE: process.env.PGDATABASE
};

// code based on example found here: https://github.com/brianc/node-postgres/wiki/Example
const runQuery = (text, values, cb) => pool.query(text, values, cb);

// Used in the database initialization scripts.
// Keeps them from hanging at the end.
const shutItDown = () => pool.end();

module.exports = {
  connectionInfo,
  runQuery,
  shutItDown
};
