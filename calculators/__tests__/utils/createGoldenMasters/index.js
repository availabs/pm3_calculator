#!/usr/bin/env node

'use strict';

const { execSync, spawn } = require('child_process');
const { createWriteStream } = require('fs');
const { join } = require('path');

const { pipeline, each } = require('mississippi');
const { sync: mkdirpSync } = require('mkdirp');
const split = require('binary-split');

const ProgressBar = require('progress');

const getTrafficDistribution = require('../getTrafficDistribution');

const GIT_HEAD = require('../getGitHistoryHashes')[0];

const inputDir = join(__dirname, '../../controlInputs');
mkdirpSync(inputDir);

const outputDir = join(__dirname, '../../calculators_output/', GIT_HEAD);
mkdirpSync(outputDir);

const MEAN = 'mean';
const TIME = 12; //number of epochs to group

const CalculateATRI = require('../../../atri');
const CalculateFreeFlow = require('../../../freeflow');
const CalculateTTR = require('../../../ttr');
const CalculatePHED = require('../../../phed');
const CalculatePtiTti = require('../../../ptitti');

// Load the tmcAttributes
const tmcAttrsFilePath = join(inputDir, 'tmcAttributes.AlbanyCounty.json.xz');
const tmcAttributes = JSON.parse(
  execSync(`xzcat '${tmcAttrsFilePath}'`, { encoding: 'utf8' })
);

const fiveteenMinIndexerFilePath = join(
  inputDir,
  'fiveteenMinIndexer.AlbanyCounty.ndjson.xz'
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
atriOS.pipe(createWriteStream(join(outputDir, 'atri.AlbanyCounty.ndjson.xz')));

const { stdin: freeFlowWS, stdout: freeFlowOS } = spawn('xz', ['-9']);
freeFlowOS.pipe(
  createWriteStream(join(outputDir, 'freeFlow.AlbanyCounty.ndjson.xz'))
);

const { stdin: ttrWS, stdout: ttrOS } = spawn('xz', ['-9']);
ttrOS.pipe(createWriteStream(join(outputDir, 'ttr.AlbanyCounty.ndjson.xz')));

const { stdin: phedWS, stdout: phedOS } = spawn('xz', ['-9']);
phedOS.pipe(createWriteStream(join(outputDir, 'phed.AlbanyCounty.ndjson.xz')));

const { stdin: ptittiWS, stdout: ptittiOS } = spawn('xz', ['-9']);
ptittiOS.pipe(
  createWriteStream(join(outputDir, 'ptitti.AlbanyCounty.ndjson.xz'))
);

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
    const tmcAttrs = tmcAttributes[tmc];

    const trafficDistribution = getTrafficDistribution(
      tmc.directionality,
      tmc.congestion_level,
      tmc.is_controlled_access
    );

    const atri = CalculateATRI(tmcAttrs, tmcFiveteenMinIndex);
    if (atri) {
      atriWS.write(JSON.stringify({ tmc, atri }) + '\n');
    }

    const freeFlow = CalculateFreeFlow(tmcAttrs, tmcFiveteenMinIndex);
    if (freeFlow) {
      freeFlowWS.write(JSON.stringify({ tmc, freeFlow }) + '\n');
    }

    const ttr = CalculateTTR(null, tmcFiveteenMinIndex);
    if (ttr) {
      ttrWS.write(JSON.stringify({ tmc, ttr }) + '\n');
    }

    const phed = CalculatePHED(
      tmcAttrs,
      tmcFiveteenMinIndex,
      trafficDistribution,
      TIME,
      MEAN
    );
    if (phed) {
      phedWS.write(JSON.stringify({ tmc, phed }) + '\n');
    }

    const ptitti = CalculatePtiTti(
      tmcAttrs,
      tmcFiveteenMinIndex,
      trafficDistribution
    );
    if (ptitti) {
      ptittiWS.write(JSON.stringify({ tmc, ptitti }) + '\n');
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
    phedWS.end();
    ptittiWS.end();
  }
);
