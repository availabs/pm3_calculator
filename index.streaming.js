#!/usr/bin/env node

const { env } = process;
const assert = require('assert');

const { split } = require('event-stream');
const transform = require('parallel-transform');

const minimist = require('minimist');

const argv = minimist(process.argv.slice(2));

const {
  DownloadTMCAtttributes,
  getTrafficDistribution
} = require('./utils/data_retrieval');

const log = require('./src/utils/log');

const csvInputStream = require('./utils/csvInputStream');
const tmcAggregator = require('./utils/inrixCSVParserStream/tmcAggregator');
const csvOutputStream = require('./utils/csvOutputStream');

const CalculateTrafficDistFactors = require('./src/calculators/trafficDistributionFactors');
const AggregateMeasureCalculator = require('./src/calculators/aggregatorMeasureCalculator');
const fiveteenMinIndexer = require('./src/calculators/fiveteenMinIndexer');

const outputCols = require('./utils/pm3OutputCols.json');

const toNumerics = require('./src/utils/toNumerics');

const {
  CONCURRENCY = 8,
  YEAR = 2017,
  STATE = 'ny',
  MEAN = 'mean',
  TIME = 12 // number of epochs to group
} = toNumerics(Object.assign({}, env, argv));

log.info({
  startup: {
    main: 'index.streaming.js',
    STATE,
    YEAR,
    MEAN,
    TIME
  }
});

const calculateMeasuresStream = (calculator, tmcAttributes) =>
  transform(
    CONCURRENCY,
    { ordered: false },
    // Data schema:
    // {
    //    meta: {
    //      tmc: <tmc code>
    //    },
    //
    //    data: [
    //      {
    //        date
    //        epoch
    //        travel_time_all_vehicles
    //       },
    //       ...
    //    ]
    async (tmcData, callback) => {
      const { metadata: { tmc }, data } = tmcData;

      const attrs = tmcAttributes[tmc];

      // INVARIANT: The NPMRDS data is for this TMC.
      const dataArrLen = data.length;
      assert(data.every(({ tmc: dTMC }) => dTMC === tmc));

      if (!attrs) {
        return null;
      }

      const { congestion_level, directionality } = CalculateTrafficDistFactors({
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

      const dirFactor = +tmc.faciltype > 1 ? 2 : 1;

      attrs.directional_aadt = tmc.aadt / dirFactor;

      const tmcFiveteenMinIndex = fiveteenMinIndexer(attrs, data);

      const measures = calculator(
        attrs,
        trafficDistribution,
        tmcFiveteenMinIndex
      );

      // INVARIANT: The NPMRDS data is for this TMC.
      assert(data.every(({ tmc: dTMC }) => dTMC === tmc));
      assert(data.length === dataArrLen);

      return process.nextTick(() => callback(null, measures));
    }
  );

async function doIt() {
  const result = await DownloadTMCAtttributes(STATE);

  const tmcAttributes = result.rows.reduce(
    (acc, row) => Object.assign(acc, { [row.tmc]: row }),
    {}
  );

  // https://stackoverflow.com/a/15884508/3970755
  process.stdout.on('error', err => {
    if (err.code === 'EPIPE') {
      process.exit(0);
    }
  });

  const calculator = AggregateMeasureCalculator({ TIME, MEAN });

  process.stdin
    .pipe(split())
    .pipe(csvInputStream())
    .pipe(tmcAggregator())
    .pipe(calculateMeasuresStream(calculator, tmcAttributes))
    .pipe(csvOutputStream(outputCols))
    .pipe(process.stdout);
}

doIt();
