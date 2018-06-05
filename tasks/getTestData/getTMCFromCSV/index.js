const { spawn } = require('child_process');
const { join } = require('path');

const csv = require('fast-csv');

const { pipeline } = require('mississippi');
const { writeArray } = require('event-stream');

const tmcDataStreamerPath = join(__dirname, './streamTMCFromLor.sh');

const getTMCDataFromCSV = async (state, year, tmc) =>
  new Promise(resolve =>
    pipeline(
      // stream the uncompressed fiveteenMinIndexerFile
      spawn(tmcDataStreamerPath, {
        encoding: 'utf8',
        env: {
          STATE: state,
          YEAR: year,
          TMC: tmc
        }
      }).stdout,
      csv({ headers: true, objectMode: true }),
      writeArray((err, data) => resolve(data))
    )
  );

module.exports = {
  getTMCDataFromCSV
};
