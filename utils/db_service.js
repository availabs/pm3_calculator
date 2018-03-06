'use strict'

const path = require('path')

const pg_js = require('pg')
const copyTo = require('pg-copy-streams').to

//const Pool = pg_native.Pool
const Pool = pg_js.Pool

const envFile = require('node-env-file')
envFile(path.join(__dirname, './postgres.env'))


const config = {
  host     : process.env.NPMRDS_POSTGRES_NETLOC,
  port     : process.env.NPMRDS_POSTGRES_PORT || undefined,
  user     : process.env.NPMRDS_POSTGRES_USER,
  password : process.env.NPMRDS_POSTGRES_PASSWORD || undefined,
  database : process.env.NPMRDS_POSTGRES_DB,
  max      : 20
}

process.on('unhandledRejection', (err) => {
  if (err && !err.message.match(/^NOTICE/)) {
    console.log(err.message || err.stack)
  }
})


const pool = new Pool(config)


 //code based on example found here: https://github.com/brianc/node-postgres/wiki/Example
const runQuery = (text, values, cb) => pool.query(text, values, cb)


// Used in the database initialization scripts.
// Keeps them from hanging at the end.
const end = () => {
  pool.end()
  pg_js.end()
}

function runStreamedQuery (query, response) {

  query = query.replace(/;/g, ' ')

  response.type('json')

  return pool.connect((err, client, done) => {

    if (err) {
      return response.status(500).send({ ERROR: err.message })
    }

    const copyStream = client.query(copyTo(`COPY (${query}) TO STDOUT`))

    copyStream.setEncoding('binary')
    copyStream.pipe(response)
    copyStream.on('error', (err2) => {
      console.error(err2)
      response.status(500).send({ ERROR: err2.message })
      return done()
    })
    copyStream.on('end', done)
    response.on('error', done)
  })
}

function runStagedQuery ({ setup, select, teardown }, cb) {
  pool.connect((err1, client, done) => {

    if (err1) {
      cb(err1)
      return rollback(client, done)
    }

    client.query(setup, (err2) => {
      if (err2) {
        cb(err2)
        return rollback(client, done)
      }

      process.nextTick(() => {

        client.query(select, (err3, data) => {
          if (err3) {
            cb(err3)
            return rollback(client, done)
          }

          process.nextTick(() => cb(null, data))

          client.query(teardown, done)
        })
      })
    })
  })
}

function runStagedStreamingQuery ({ setup, select, teardown }, response) {

  select = select.replace(/;/g, ' ')

  response.type('json')

  pool.connect((err1, client, done) => {

    let handledDone = false

    if (err1) {
      handledDone = true
      response.status(500).send({ ERROR: err1.message })
      return rollback(client, done)
    }

    client.query(setup, (err2) => {
      if (err2) {
        handledDone = true
        response.status(500).send({ ERROR: err2.message })
        return rollback(client, done)
      }

      const copyStream = client.query(copyTo(`COPY (${select}) TO STDOUT; ${teardown}`))
      copyStream.setEncoding('binary')
      copyStream.pipe(response)

      copyStream.on('error', (err3) => {
        // console.log("copyStream.on('error'")
        if (!handledDone) {
          response.status(500).send({ ERROR: err3.message })
          handledDone = true
          return rollback(client, done)
        } else {
          console.log('copyStream on error called after done.')
        }
      })

      copyStream.on('end', async () => {
        // console.log("copyStream.on('end'")
        handledDone = true
        done()
      })

      response.on('error', async () => {
        // console.log("response.on('error'")
        handledDone = true
        done()
      })
    })
  })
}


function rollback (client, done) {
  client.query('ROLLBACK', (err) => {
    //if there was a problem rolling back the query
    //something is seriously messed up.  Return the error
    //to the done function to close & remove this client from
    //the pool.  If you leave a client in the pool with an unaborted
    //transaction weird, hard to diagnose problems might happen.
    return done(err)
  })
}

function getDiagnostics () {
  const inUseObjectsActiveQueryText = pool.pool._inUseObjects.map(obj => 
    obj.activeQuery && obj.activeQuery.text
  ).filter(s => s)

  return {
    poolSize: pool.pool.getPoolSize(),
    availableObjectsCount: pool.pool.waitingClientsCount(),
    inUseObjectsCount: pool.pool.inUseObjectsCount(),
    waitingClientsCount: pool.pool.waitingClientsCount(),
    inUseObjectsActiveQueryText,
  }
}

module.exports = {
  getDiagnostics,
  runQuery,
  runStreamedQuery,
  runStagedQuery,
  runStagedStreamingQuery,
  end,
}
