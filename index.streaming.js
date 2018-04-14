#!/usr/bin/env node

const { env } = process;
const fs = require('fs');

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

const outputCols = [
  'tmc',
  'faciltype',
  'aadt',
  'length',
  'avg_speedlimit',
  'congestion_level',
  'directionality',
  'avg_vehicle_occupancy',
  'nhs',
  'nhs_pct',
  'is_interstate',
  'is_controlled_access',
  'mpo',
  'ua',
  'county',
  'state',
  'directional_aadt',
  'lottr_am',
  'lottr_off',
  'lottr_pm',
  'lottr_weekend',
  'tttr_am',
  'tttr_off',
  'tttr_pm',
  'tttr_overnight',
  'tttr_weekend',
  'vd_1',
  'vd_2',
  'vd_3',
  'vd_4',
  'vd_5',
  'vd_6',
  'vd_7',
  'vd_8',
  'vd_9',
  'vd_10',
  'vd_11',
  'vd_12',
  'vd_total',
  'd_1',
  'd_2',
  'd_3',
  'd_4',
  'd_5',
  'd_6',
  'd_7',
  'd_8',
  'd_9',
  'd_10',
  'd_11',
  'd_12',
  'd_total'
];

const toNumerics = o =>
  Object.keys(o).reduce((acc, k) => {
    acc[k] = Number.isFinite(+o[k]) ? parseFloat(o[k]) : o[k];
    return acc;
  }, {});

const {
  CONCURRENCY = 8,
  SPEED_FILTER = 3,
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
