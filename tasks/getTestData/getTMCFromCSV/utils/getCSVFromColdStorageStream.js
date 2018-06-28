const { spawn } = require('child_process');
const { join } = require('path');

const tmcDataStreamerPath = join(__dirname, './streamTMCFromLor.sh');

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

module.exports = getCSVFromColdStorageStream;
