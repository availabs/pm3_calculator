const path = require('path');

// const Pool = pg_native.Pool
const { Pool } = require('pg');

const envFile = require('node-env-file');

envFile(path.join(__dirname, './inrix_postgres.env'));

const config = {
  host: process.env.NPMRDS_POSTGRES_NETLOC,
  port: process.env.NPMRDS_POSTGRES_PORT || undefined,
  user: process.env.NPMRDS_POSTGRES_USER,
  password: process.env.NPMRDS_POSTGRES_PASSWORD || undefined,
  database: process.env.NPMRDS_POSTGRES_DB,
  max: 40
};

const pool = new Pool(config);

// code based on example found here: https://github.com/brianc/node-postgres/wiki/Example
const runQuery = (text, values, cb) => pool.query(text, values, cb);

// Used in the database initialization scripts.
// Keeps them from hanging at the end.
const shutItDown = () => pool.end();

module.exports = {
  runQuery,
  shutItDown
};
