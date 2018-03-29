#!/usr/bin/env node

const { env } = process;

const Promise = require('bluebird');
const fs = require('fs');

const { split, through, stringify } = require('event-stream');
const transform = require('parallel-transform');

const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));

const {
  DownloadTMCAtttributes,
  getTrafficDistribution
} = require('./utils/data_retrieval');

const csvInputStream = require('./utils/csvInputStream');
const tmcAggregator = require('./utils/inrixCSVParserStream/tmcAggregator');
const csvOutputStream = require('./utils/csvOutputStream');

const CalculatePHED = require('./calculators/phed');
const CalculateTTR = require('./calculators/ttr');
const CalculateTrafficDistFactors = require('./calculators/trafficDistributionFactors');

const outputCols = [
  'tmc',
  'congestion_level',
  'directionality',
  'combinedPeakAvgTT',
  'amPeakAvgTT',
  'pmPeakAvgTT',
  'freeFlowAvgTT',
  'speedReductionFactor',
  'peakTimeDifferential',
  'peakSpeedDifferential'
];

const toNumerics = o =>
  Object.keys(o).reduce((acc, k) => {
    acc[k] = Number.isFinite(+o[k]) ? parseFloat(o[k]) : o[k];
    return acc;
  }, {});

const { CONCURRENCY = 4, STATE = 'nj' } = toNumerics(
  Object.assign({}, env, argv)
);

const calculateTrafficDistributionFactors = tmcAttributes => {
  return transform(
    CONCURRENCY,
    // Data schema:
    // {
    //    meta: {
    //      tmc: <tmc code>
    //      year: <year>
    //    },
    //
    //    data: [
    //      {
    //        npmrds_date
    //        epoch
    //        travel_time_all_vehicles
    //       },
    //       ...
    //    ]
    function write(tmcData, callback) {
      const { metadata: { tmc }, data } = tmcData;

      const attrs = tmcAttributes[tmc];

      if (!attrs) {
        return;
      }

      const distFactors = CalculateTrafficDistFactors({
        attrs,
        data
      });

      distFactors.combinedPeakAvgTT = +distFactors.combinedPeakAvgTT.toFixed(3);
      distFactors.amPeakAvgTT = +distFactors.amPeakAvgTT.toFixed(3);
      distFactors.pmPeakAvgTT = +distFactors.pmPeakAvgTT.toFixed(3);
      distFactors.freeFlowAvgTT = +distFactors.freeFlowAvgTT.toFixed(3);
      distFactors.speedReductionFactor = +distFactors.speedReductionFactor.toFixed(
        3
      );
      distFactors.peakTimeDifferential = +distFactors.peakTimeDifferential.toFixed(
        3
      );
      distFactors.peakSpeedDifferential = +distFactors.peakSpeedDifferential.toFixed(
        3
      );

      return callback(null, Object.assign({}, { tmc }, distFactors));
    }
  );
};

async function doIt() {
  const result = await DownloadTMCAtttributes(STATE);

  const tmcAttributes = result.rows.reduce(
    (acc, row) => Object.assign(acc, { [row.tmc]: row }),
    {}
  );

  // https://stackoverflow.com/a/15884508/3970755
  process.stdout.on('error', function(err) {
    if (err.code == 'EPIPE') {
      process.exit(0);
    }
  });

  process.stdin
    .pipe(split())
    .pipe(csvInputStream())
    .pipe(tmcAggregator())
    .pipe(calculateTrafficDistributionFactors(tmcAttributes))
    .pipe(csvOutputStream(outputCols))
    .pipe(process.stdout);
}

doIt();
