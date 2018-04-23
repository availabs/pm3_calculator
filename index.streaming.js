#!/usr/bin/env node

const { env } = process;
const fs = require('fs');

const { join } = require('path')


const { split, stringify } = require('event-stream');
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

const CalculateTrafficDistFactors = require('./calculators/trafficDistributionFactors');
const AggregateMeasureCalculator = require('./calculators/aggregatorMeasureCalculator');


const outputCols = require(join(__dirname, './utils/pm3OutputCols.json'));


const toNumerics = o =>
  Object.keys(o).reduce((acc, k) => {
    acc[k] = Number.isFinite(+o[k]) ? parseFloat(o[k]) : o[k];
    return acc;
  }, {});

const {
  CONCURRENCY = 8,
  SPEED_FILTER = 0,
  DIR = 'data/',
  YEAR = process.env.YEAR || 2017,
  STATE = process.env.STATE || 'ny',
  MEAN = 'mean',
  TIME = 12 //number of epochs to group
} = toNumerics(Object.assign({}, env, argv));

const calculateMeasuresStream = (calculator, tmcAttributes) => {
  return transform(
    CONCURRENCY,
    { ordered: false },
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
    async function write(tmcData, callback) {
      const { metadata: { tmc }, data } = tmcData;

      const attrs = tmcAttributes[tmc];

      if (!attrs) {
        return;
      }

      const { congestion_level, directionality } = CalculateTrafficDistFactors({
        attrs,
        data
      });

      attrs.congestion_level = congestion_level || attrs.congestion_level;
      attrs.directionality = directionality || attrs.directionality;


      var trafficDistribution = getTrafficDistribution(
        tmc.directionality,
        tmc.congestion_level,
        tmc.is_controlled_access,
        TIME,
        'cattlab'
      );


      const tmcFiveteenMinIndex = data.reduce((output, current) => {
        const reduceIndex =
          // current.npmrds_date + '_' + Math.floor(current.epoch / 3);
          current.date + '_' + Math.floor(current.epoch / 3);

        if (!output[reduceIndex]) {
          output[reduceIndex] = { speed: [], tt: [] };
        }

        output[reduceIndex].speed.push(
          +attrs.length / (current.travel_time_all_vehicles / 3600)
        );

        output[reduceIndex].tt.push(
          +Math.round(current.travel_time_all_vehicles)
        );

        return output;
      }, {});

      const measures = calculator(
        attrs,
        trafficDistribution,
        tmcFiveteenMinIndex
      );

      return process.nextTick(() => callback(null, measures));
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
