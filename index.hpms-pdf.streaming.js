#!/usr/bin/env node

const { env } = process;

const { split } = require('event-stream');
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
const MeasureAggregator = require('./calculators/hpmsPDFMeasureAggregator');
const fiveteenMinIndexer = require('./calculators/fiveteenMinIndexer');

const outputCols = require('./utils/hpmsPDFOutputCols.json');

const toNumerics = o =>
  Object.keys(o).reduce((acc, k) => {
    acc[k] = Number.isFinite(+o[k]) ? parseFloat(o[k]) : o[k];
    return acc;
  }, {});

const {
  YEAR = 2017,
  CONCURRENCY = 8,
  STATE = 'ny',
  MEAN = 'mean',
  TIME = 12 // number of epochs to group
} = toNumerics(Object.assign({}, env, argv));

const calculateMeasuresStream = (calculator, tmcAttributes) =>
  transform(CONCURRENCY, { ordered: false }, async (tmcData, callback) => {
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

    const trafficDistribution = getTrafficDistribution(
      tmc.directionality,
      tmc.congestion_level,
      tmc.is_controlled_access,
      TIME,
      'cattlab'
    );

    const tmcFiveteenMinIndex = fiveteenMinIndexer(attrs, data);

    const measures = calculator(
      attrs,
      trafficDistribution,
      tmcFiveteenMinIndex
    );

    process.nextTick(() => callback(null, measures));
  });

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

  const calculator = MeasureAggregator({ TIME, MEAN, YEAR });

  process.stdin
    .pipe(split())
    .pipe(csvInputStream())
    .pipe(tmcAggregator())
    .pipe(calculateMeasuresStream(calculator, tmcAttributes))
    .pipe(csvOutputStream(outputCols, '|'))
    .pipe(process.stdout);
}

doIt();
