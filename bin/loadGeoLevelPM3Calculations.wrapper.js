#!/usr/bin/env node

const { spawn } = require('child_process');
const { createReadStream } = require('fs');
const { join, basename } = require('path');

const {
  parse: parseDefaultGeoLevelPM3CalcFileName
} = require('../src/utils/DefaultGeoLevelPM3CalcFileName');

const loaderPath = join(__dirname, './loadGeoLevelPM3Calculations.js');

const filePath = process.argv[2];

if (!filePath) {
  console.error('ERROR: Specify the csv path as the first cli argument.');
  process.exit(1);
}

const {
  state,
  year,
  npmrdsVer,
  geoLevelPM3CalcVer
} = parseDefaultGeoLevelPM3CalcFileName(basename(filePath));

const inFileStream = createReadStream(filePath);

const loader = spawn('bash', ['-c', `node ${loaderPath}`], {
  encoding: 'utf8',
  env: {
    STATE: state,
    YEAR: year,
    NPMRDS_VER: npmrdsVer,
    GEO_LEVEL_PM3_CALC_VER: geoLevelPM3CalcVer
  }
});

inFileStream.pipe(loader.stdin);

loader.stdout.pipe(process.stdout);
loader.stderr.pipe(process.stderr);
