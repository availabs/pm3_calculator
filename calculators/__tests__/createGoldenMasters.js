'use strict';

const { execSync, spawn } = require('child_process');
const { createWriteStream } = require('fs');
const { join } = require('path');

const { pipeline, each } = require('mississippi');
const split = require('binary-split');

const ProgressBar = require('progress');

const CalculateATRI = require('../atri');
const CalculateFreeFlow = require('../freeflow');
const CalculateTTR = require('../ttr');

// Load the tmcAttributes
const tmcAttrsFilePath = join(
  __dirname,
  './tmcAttributes.AlbanyCounty.json.xz'
);
const tmcAttributes = JSON.parse(
  execSync(`xzcat '${tmcAttrsFilePath}'`, { encoding: 'utf8' })
);

const fiveteenMinIndexerFilePath = join(
  __dirname,
  './fiveteenMinIndexer.AlbanyCounty.ndjson.xz'
);

// Get the number of entries in the fiveteenMinIndexerFile
const fiveteenMinIndexesCount = +execSync(
  `xzcat ${fiveteenMinIndexerFilePath} | wc -l`,
  { encoding: 'utf8' }
).split(' ')[0];

// Initialize the progress bar
const bar = new ProgressBar(
  '[:bar] :current/:total = :percent  :elapsed/:eta',
  {
    total: fiveteenMinIndexesCount
  }
);

const { stdin: atriWS, stdout: atriOS } = spawn('xz', ['-9']);
atriOS.pipe(createWriteStream(join(__dirname, 'atri.AlbanyCounty.ndjson.xz')));

const { stdin: freeFlowWS, stdout: freeFlowOS } = spawn('xz', ['-9']);
freeFlowOS.pipe(
  createWriteStream(join(__dirname, 'freeFlow.AlbanyCounty.ndjson.xz'))
);

const { stdin: ttrWS, stdout: ttrOS } = spawn('xz', ['-9']);
ttrOS.pipe(createWriteStream(join(__dirname, 'ttr.AlbanyCounty.ndjson.xz')));

each(
  pipeline(
    // stream the uncompressed fiveteenMinIndexerFile
    // CONSIDER: Taking input from cli provided "files" would be more flexible.
    //           (Especially using process substitution)
    spawn('xzcat', [fiveteenMinIndexerFilePath], {
      encoding: 'utf8'
    }).stdout,
    // split on new lines
    split()
  ),
  // for each line of the uncompressed fiveteenMinIndexerFile,
  //   run each calculator and write the output
  //   to the respective "Golden Master" file.
  (line, next) => {
    const { tmc, tmcFiveteenMinIndex } = JSON.parse(line.toString());
    const tmcAttr = tmcAttributes[tmc];

    const atri = CalculateATRI(tmcAttr, tmcFiveteenMinIndex);
    if (atri) {
      atriWS.write(JSON.stringify({ tmc, atri }) + '\n');
    }

    const freeFlow = CalculateFreeFlow(tmcAttr, tmcFiveteenMinIndex);
    if (freeFlow) {
      freeFlowWS.write(JSON.stringify({ tmc, freeFlow }) + '\n');
    }

    const ttr = CalculateTTR(null, tmcFiveteenMinIndex);
    if (ttr) {
      ttrWS.write(JSON.stringify({ tmc, ttr }) + '\n');
    }

    bar.tick();
    next();
  },
  err => {
    // TODO: Cleanup the output files.
    if (err) {
      console.error(err);
      process.exit(1);
    }

    // Close the write streams.
    atriWS.end();
    freeFlowWS.end();
    ttrWS.end();
  }
);
