const { join } = require('path');

const { Pool } = require('pg');

const envFile = require('node-env-file');

envFile(join(__dirname, '../config/postgres.v1.env'));

const config = {
  host: process.env.NPMRDSv1_POSTGRES_NETLOC,
  port: process.env.NPMRDSv1_POSTGRES_PORT || undefined,
  user: process.env.NPMRDSv1_POSTGRES_USER,
  password: process.env.NPMRDSv1_POSTGRES_PASSWORD || undefined,
  database: process.env.NPMRDSv1_POSTGRES_DB,
  max: 40
};

const pool = new Pool(config);

const runQuery = (text, values, cb) => pool.query(text, values, cb);

// Used in the database initialization scripts.
// Keeps them from hanging at the end.
module.exports = {
  runQuery
};
