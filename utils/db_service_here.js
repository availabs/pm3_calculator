'use strict'

const path = require('path')

const pg_js = require('pg')
const copyTo = require('pg-copy-streams').to

//const Pool = pg_native.Pool
const Pool = pg_js.Pool

const envFile = require('node-env-file')
envFile(path.join(__dirname, './here_postgres.env'))


const config = {
  host     : process.env.NPMRDSv1_POSTGRES_NETLOC,
  port     : process.env.NPMRDSv1_POSTGRES_PORT || undefined,
  user     : process.env.NPMRDSv1_POSTGRES_USER,
  password : process.env.NPMRDSv1_POSTGRES_PASSWORD || undefined,
  database : process.env.NPMRDSv1_POSTGRES_DB,
  max      : 40
}

// process.on('unhandledRejection', (err) => {
//   if (err && !err.message.match(/^NOTICE/)) {
//     console.log('here db error:',err.message || err.stack)
//   }
// })


const pool = new Pool(config)

 //code based on example found here: https://github.com/brianc/node-postgres/wiki/Example
const runQuery = (text, values, cb) => pool.query(text, values, cb)


// Used in the database initialization scripts.
// Keeps them from hanging at the end.

module.exports = {
  runQuery
}
