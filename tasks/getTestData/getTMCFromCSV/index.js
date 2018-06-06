const { spawn } = require('child_process');
const { join } = require('path');
const { existsSync, createWriteStream } = require('fs');
const { sync: mkdirpSync } = require('mkdirp');

const { split } = require('event-stream');

const csvInputStream = require('../../../utils/csvInputStream');
const tmcAggregator = require('../../../utils/inrixCSVParserStream/tmcAggregator');

const { writeArray } = require('event-stream');

const tmcDataStreamerPath = join(__dirname, './streamTMCFromLor.sh');

const cacheDir = join(__dirname, './csv');

const getCachedFilePath = (state, year, tmc) =>
  join(cacheDir, `${state.toLowerCase()}.${year}.${tmc.toUpperCase()}.csv.xz`);

// Get the CSV from the local cache
const getCSVFromLocalCacheStream = path =>
  spawn('xzcat', [path], {
    encoding: 'utf8'
  }).stdout;

// Stream the TMC's rows from the CSV in storage.rit
const getCSVFromColdStorageStream = (state, year, tmc) =>
  spawn(tmcDataStreamerPath, {
    encoding: 'utf8',
    env: {
      STATE: state,
      YEAR: year,
      TMC: tmc
    }
  }).stdout;

// Get the TMC's NPMRDS data, using the same parsing pipeline as index.streaming
const getTMCDataFromCSV = (state, year, tmc) => {
  const path = getCachedFilePath(state, year, tmc);

  const cachedFileExists = existsSync(path);

  const csvStream = cachedFileExists
    ? getCSVFromLocalCacheStream(path)
    : getCSVFromColdStorageStream(state, year, tmc);

  if (!cachedFileExists) {
    mkdirpSync(cacheDir);

    // Compress the CSV and write to the local cache.
    const { stdin: xzSTDIN, stdout: xzSTDOUT } = spawn('xz', ['-9']);
    csvStream.pipe(xzSTDIN); // SEE https://stackoverflow.com/a/17978574/3970755
    xzSTDOUT.pipe(createWriteStream(path));
  }

  return new Promise(resolve => {
    csvStream
      .pipe(split())
      .pipe(csvInputStream())
      .pipe(tmcAggregator())
      .pipe(
        // tmcAggregator emits data objects with the following structure: { meta, data }
        // In this specific case, it emits a single such data object for the requested TMC.
        writeArray((err, [{ data }]) => resolve(data))
      );
  });
};

module.exports = {
  getTMCDataFromCSV
};
