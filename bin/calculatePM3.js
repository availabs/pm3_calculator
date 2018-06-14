#!/usr/bin/env node

/* eslint global-require: 0 */
/* eslint no-param-reassign: 0 */
/* eslint no-restricted-syntax: 0 */

const { env } = process;
const assert = require('assert');
const minimist = require('minimist');
const { pipeline: { obj: pipelineObj } } = require('mississippi');
const deepFreeze = require('deep-freeze');

const outputCols = require('../utils/pm3OutputCols.json');
const csvOutputStream = require('../utils/csvOutputStream');

const { STREAM } = require('../src/constants/NPMRDS_DATA_SOURCES');

const { generateTMCData } = require('../src/DAOs/TMCDataDAO');

const calculateTrafficDistFactors = require('../src/calculators/trafficDistributionFactors');
const AggregateMeasureCalculator = require('../src/calculators/aggregatorMeasureCalculator');
const fiveteenMinIndexer = require('../src/calculators/fiveteenMinIndexer');

const { getTrafficDistribution } = require('../utils/data_retrieval');

const toNumerics = require('../src/utils/toNumerics');
const log = require('../src/utils/log');

// https://stackoverflow.com/a/15884508/3970755
process.stdout.on('error', err => {
  if (err.code === 'EPIPE') {
    process.exit(0);
  }
});

const {
  CSV_PATH,
  HEAD,
  MEAN,
  NPMRDS_DATA_SOURCE,
  STATE,
  TIME, // number of epochs to group
  TMC,
  TMCS,
  YEAR
} = toNumerics(env);

const argv = minimist(process.argv.slice(2), {
  alias: {
    csvPath: 'CSV_PATH',
    head: 'HEAD',
    mean: 'MEAN',
    npmrdsDataSource: 'NPMRDS_DATA_SOURCE',
    state: 'STATE',
    time: 'TIME',
    tmcs: ['TMC', 'TMCS', 'tmc'],
    year: 'YEAR'
  }
});

const {
  csvPath = CSV_PATH,
  head = HEAD,
  mean = MEAN || 'mean',
  npmrdsDataSource = NPMRDS_DATA_SOURCE,
  state = STATE || 'ny',
  time = TIME || 12,
  tmcs = TMC || TMCS,
  year = YEAR || 2017
} = toNumerics(argv);

log.info({
  startup: {
    main: 'bin/calculatePM3.js',
    variables: {
      csvPath,
      head,
      mean,
      npmrdsDataSource,
      state,
      time,
      tmcs,
      year
    }
  }
});

const doIt = async ({ calculator, outputPipeline }) => {
  try {
    const config = {
      state,
      year,
      tmcs: tmcs && tmcs.split(/,|\s/).map(tmc => tmc.toUpperCase()),
      npmrdsDataSource,
      csvPath,
      head
    };

    if (npmrdsDataSource === STREAM) {
      config.stream = process.stdin;
    }

    const tmcDataIterator = generateTMCData(config);

    for await (const { attrs, data } of tmcDataIterator) {
      if (!(attrs && attrs.tmc)) {
        const tmc = data && data.length && data[0].tmc;
        log.warn(
          `Empty attrs returned by tmcDataIterator${
            tmc ? ` for tmc ${tmc}` : ''
          }`
        );
        return;
      }

      const { tmc } = attrs;

      // INVARIANT: The NPMRDS data is immutable
      deepFreeze(data);

      // INVARIANT: The NPMRDS data is for this TMC
      assert(data.every(({ tmc: dTMC }) => dTMC === tmc));

      const { congestion_level, directionality } = calculateTrafficDistFactors({
        attrs,
        data
      });

      attrs.congestion_level = congestion_level || attrs.congestion_level;
      attrs.directionality = directionality || attrs.directionality;

      const trafficDistribution = getTrafficDistribution(
        attrs.directionality,
        attrs.congestion_level,
        attrs.is_controlled_access,
        TIME,
        'cattlab'
      );

      const dirFactor = +attrs.faciltype > 1 ? 2 : 1;

      attrs.directional_aadt = attrs.aadt / dirFactor;

      const tmcFiveteenMinIndex = fiveteenMinIndexer(attrs, data);

      const measures = calculator(
        attrs,
        trafficDistribution,
        tmcFiveteenMinIndex
      );

      // INVARIANT: The NPMRDS data is for this TMC.
      assert(data.every(({ tmc: dTMC }) => dTMC === tmc));

      outputPipeline.write(measures);
    }
  } catch (err) {
    log.error(err);
    process.exit(1);
  }
};

doIt({
  calculator: AggregateMeasureCalculator({ TIME: time, MEAN: mean }),
  outputPipeline: pipelineObj(csvOutputStream(outputCols), process.stdout)
});
