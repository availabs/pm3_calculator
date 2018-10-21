const path = require('path');
const { Pool } = require('pg');
const envFile = require('node-env-file');

envFile(path.join(__dirname, '../../config/postgres.v1.env'));

const connectionInfo = {
  host: process.env.NPMRDSv1_PGHOST,
  port: process.env.NPMRDSv1_PGPORT,
  user: process.env.NPMRDSv1_PGUSER,
  password: process.env.NPMRDSv1_PGPASSWORD,
  database: process.env.NPMRDSv1_PGDATABASE
};

const pool = new Pool(connectionInfo);

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
