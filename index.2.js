#!/usr/bin/env node

/* eslint no-console: 0 */

const { env } = process;
const { spawn } = require('child_process');
const { createWriteStream, createReadStream } = require('fs');
const { join, isAbsolute, relative, basename, dirname } = require('path');
const minimist = require('minimist');
const { sync: mkdirpSync } = require('mkdirp');

const { DATABASE } = require('./src/constants/NPMRDS_DATA_SOURCES');

const toNumerics = require('./src/utils/toNumerics');
const log = require('./src/utils/log');

const pm3CalculatorPath = join(__dirname, './bin/calculatePM3.js');

// https://stackoverflow.com/a/15884508/3970755
process.stdout.on('error', err => {
  if (err.code === 'EPIPE') {
    process.exit(0);
  }
});

const {
  DIR,
  HEAD,
  MEAN,
  OUTPUT_FILE,
  STATE,
  TABLE_VERSION,
  UPLOAD_TO_DB,
  TIME, // number of epochs to group
  TMC,
  TMCS,
  YEAR
} = toNumerics(env);

const argv = minimist(process.argv.slice(2), {
  alias: {
    dir: ['DIR', 'outputDir', 'outputDirectory'],
    head: 'HEAD',
    mean: 'MEAN',
    outputFile: ['outF', 'outFile', 'OUTPUT_FILE'],
    state: 'STATE',
    time: 'TIME',
    tmcs: ['TMC', 'TMCS', 'tmc'],
    tableVersion: 'TABLE_VERSION',
    uploadToDB: 'UPLOAD_TO_DB',
    year: 'YEAR'
  }
});

if (env.TMC && env.TMCS) {
  log.error(
    'ERROR: The TMC and TMCS environment variables cannot both be defined.'
  );
  process.exit(1);
}

const {
  dir = DIR,
  head = HEAD,
  mean = MEAN || 'mean',
  outputFile = OUTPUT_FILE,
  state = STATE || 'ny',
  time = TIME || 12,
  tmcs = TMC || TMCS,
  tableVersion = TABLE_VERSION ||
    new Date().toISOString().replace(/-|:|\..*/g, ''),
  uploadToDB = UPLOAD_TO_DB || true,
  year = YEAR || 2017
} = toNumerics(argv);

if (dir && outputFile) {
  if (basename(outputFile) !== outputFile) {
    console.error(
      'If both dir & outputFile are specified, outputFile must be a basename only.'
    );
    process.exit(1);
  }
}

let outputDir;
if (dir) {
  outputDir = isAbsolute(dir) ? dir : join(__dirname, dir);
} else if (outputFile) {
  outputDir = isAbsolute(outputFile)
    ? dirname(outputFile)
    : join(__dirname, dirname(outputFile));
} else {
  outputDir = join(__dirname, './data/');
}

const tmcsQualifier = tmcs ? `.${tmcs.replace(/,|_/, '_')}` : '';
const headQualifier = head ? `.head-${head}` : '';

const outputFilePath = join(
  outputDir,
  outputFile
    ? basename(outputFile)
    : `${state}_${year}_${mean}_${time}${tmcsQualifier}${headQualifier}.csv`
);

mkdirpSync(outputDir);

log.info({
  startup: {
    main: 'index.2.js',
    variables: {
      head,
      mean,
      outputFilePath: relative(__dirname, outputFilePath),
      tableVersion,
      state,
      time,
      tmcs,
      uploadToDB,
      year
    }
  }
});

const { stdout, stderr } = spawn('bash', ['-c', `node ${pm3CalculatorPath}`], {
  env: {
    DIR: dir,
    HEAD: head,
    MEAN: mean,
    NPMRDS_DATA_SOURCE: DATABASE,
    STATE: state,
    TIME: time,
    TMCS: tmcs,
    YEAR: year
  },
  encoding: 'utf8'
});

const outFileStream = createWriteStream(outputFilePath);
stdout.pipe(outFileStream);
stderr.pipe(process.stderr);

if (uploadToDB) {
  outFileStream.on('finish', () => {
    const inFileStream = createReadStream(outputFilePath);
    const loaderPath = join(__dirname, './bin/loadPM3Calculations.js');
    const loader = spawn('bash', ['-c', `node ${loaderPath}`], {
      encoding: 'utf8',
      env: {
        HEAD: head,
        MEAN: mean,
        NPMRDS_DATA_SOURCE: DATABASE,
        STATE: state,
        TABLE_VERSION: tableVersion,
        TIME: time,
        TMCS: tmcs,
        YEAR: year
      }
    });

    inFileStream.pipe(loader.stdin);
    loader.stdout.pipe(process.stdout);
    loader.stderr.pipe(process.stderr);
  });
}
