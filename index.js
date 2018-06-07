#!/usr/bin/env node

/* eslint no-param-reassign: 0 */

const { env } = process;

const Promise = require('bluebird');
const ProgressBar = require('progress');
const fs = require('fs');
const d3 = require('d3-dsv');
const minimist = require('minimist');

const argv = minimist(process.argv.slice(2));

const {
  DownloadTMCData,
  DownloadTMCAtttributes,
  getTrafficDistribution
} = require('./utils/data_retrieval');

const CalculateTrafficDistFactors = require('./calculators/trafficDistributionFactors');
const AggregateMeasureCalculator = require('./calculators/aggregatorMeasureCalculator');
const fiveteenMinIndexer = require('./calculators/fiveteenMinIndexer')

const toNumerics = require('./utils/toNumerics')

// NOTE: cli arguments override env arguments
const {
  SPEED_FILTER = 3,
  DIR = 'test_data/',
  YEAR = 2017,
  STATE = 'ny',
  MEAN = 'mean',
  TIME = 12, // number of epochs to group
  FULL = false,
  START,
  END
} = toNumerics(Object.assign({}, env, argv));

let bar = null;

function CalculateMeasures(tmc, year) {
  const { calculator } = this;

  return DownloadTMCData(tmc.tmc, year, STATE).then(tmcData => {
    return new Promise(function(resolve, reject) {

      const { congestion_level, directionality } = CalculateTrafficDistFactors({
        attrs: tmc,
        data: tmcData.rows
      });

      tmc.congestion_level = congestion_level || tmc.congestion_level;
      tmc.directionality = directionality || tmc.directionality;

      const trafficDistribution = getTrafficDistribution(
        tmc.directionality,
        tmc.congestion_level,
        tmc.is_controlled_access,
        TIME,
        'cattlab'
      );
      var dirFactor = +tmc.faciltype > 1 ? 2 : 1;

      tmc.directional_aadt = tmc.aadt / dirFactor;

      const tmcFiveteenMinIndex = fiveteenMinIndexer(tmc, tmcData.rows, { SPEED_FILTER })

      if (Object.keys(tmcFiveteenMinIndex || {}).length < 1) {
        return resolve(null);
      }

      const measures = calculator(
        tmc,
        trafficDistribution,
        tmcFiveteenMinIndex
      );

      bar.tick();

      return resolve(measures);
    });
  });
}

DownloadTMCAtttributes(STATE).then(tmcs => {
  let testTmcs = [];

  if (FULL) {
    testTmcs = tmcs.rows; //.filter((d, i) => d.tmc === "120P11204");
  } else if (START && END){
    testTmcs = tmcs.rows
      .filter((d,i) => i >= START && i < END)
  } else {
    testTmcs = tmcs.rows
      .filter((d, i) => d.tmc === "120N05397")
      //.filter((d, i) => i < 30)
  }

  TOTAL = testTmcs.length;

  bar = new ProgressBar('[:bar] :current/:total = :percent  :elapsed/:eta', {
    total: TOTAL
  });

  const calculator = AggregateMeasureCalculator({ TIME, MEAN });
  const calculateMeasures = CalculateMeasures.bind({ calculator });

  return Promise.map(
    testTmcs,
    tmc => {
      return calculateMeasures(tmc, YEAR);
    },
    { concurrency: 30 }
  ).then(measures => {
    var output = d3.csvFormat(measures.filter(x => x));
    // console.log(measures)
    let startEnd = START 
      ? `_${START}_${END}`
      : ''

    fs.writeFile(`${DIR}${STATE}_${YEAR}_${MEAN}_${TIME}${startEnd}.csv`, output, function(
      err
    ) {
      if (err) {
        return console.log(err);
      }
      console.log('The file was saved!');
      return;
    });
    return;
  });
});
