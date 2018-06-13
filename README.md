# NPRMDS PM3 Calculator

## Node Version

The calculator requires Node.js version 10.
This dependency is because async iteration over readable streams is a new feature.
Aync iteration over readable streams provides a clean 
unified interface for taking input data from
either a series of async database calls or streamed CSVs.

[further reading](http://2ality.com/2018/04/async-iter-nodejs.html)

### Using Node v10

1. Update n: `sudo npm install -g n`
1. Update npm: `sudo npm install -g npm`
1. Update Node: `sudo n latest`
1. `rm -rf node_modules`
1. `npm install`

## Running the calculator

Note: index.js & index.streaming.js will soon be replaces with scripts
that call bin/calculatePM3.js with the appropriate ENV variables.

### From STDIN

```
xzcat ../tasks/hpmsPDF/albanyCountyNPMRDS.2017.csv.xz| ./calculatePM3.js --state=ny --year=2017 --npmrdsDataSource=STREAM
```

### From a FILE

```
./calculatePM3.js --state=ny --year=2017 --npmrdsDataSource=FILE --csvPath=../tasks/hpmsPDF/albanyCountyNPMRDS.2017.csv.xz
```

### From the Database

```
./calculatePM3.js --state=ny --year=2017 --npmrdsDataSource=DATABASE --tmc='104-04106'
```

------------------

## Database credentials

* The single source of truth for db credentials should be `config/postgres.env`.
* The python script `utils/connection_data.py` now
  parses this file and exports a Psycopg config object.
* To switch between local development and production databases,
  it is helpful to use a softlink named `config/postgres.env` that points
  to either a `postgres.env.local` or a `postgres.env.prod`
