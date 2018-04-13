#!/usr/bin/env node

const { env } = process;

let Promise = require('bluebird');
let ProgressBar = require('progress');
let fs = require('fs');
let d3 = require('d3-dsv');

const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));

let {
  DownloadTMCData,
  DownloadTMCAtttributes,
  getTrafficDistribution
} = require('./utils/data_retrieval');

const AggregateMeasureCalculator = require('./calculators/aggregatorMeasureCalculator');

let bar = null;

const toNumerics = o =>
  Object.keys(o).reduce((acc, k) => {
    acc[k] = Number.isFinite(+o[k]) ? parseFloat(o[k]) : o[k];
    return acc;
  }, {});

const {
  SPEED_FILTER = 3,
  DIR = 'data/',
  YEAR = process.env.YEAR || 2017,
  STATE = process.env.STATE || 'ny',
  MEAN = 'mean',
  TIME = 12 //number of epochs to group
} = toNumerics(Object.assign({}, env, argv));

function CalculateMeasures(tmc, year) {
  

  const { calculator } = this;

  var trafficDistribution = getTrafficDistribution(
    tmc.directionality,
    tmc.congestion_level,
    tmc.is_controlled_access,
    TIME,
    'cattlab'
  );
  var dirFactor = +tmc.faciltype > 1 ? 2 : 1;

  tmc.directional_aadt = tmc.aadt / dirFactor;

  return DownloadTMCData(tmc.tmc, year, STATE).then(tmcData => {
    return new Promise(function(resolve, reject) {
      var tmcFiveteenMinIndex = tmcData.rows.reduce((output, current) => {
        var reduceIndex =
          current.npmrds_date + '_' + Math.floor(current.epoch / 3);
        let speed = +tmc.length / (current.travelTime / 3600);
        if (SPEED_FILTER && speed > SPEED_FILTER) {
          if (!output[reduceIndex]) {
            output[reduceIndex] = { speed: [], tt: [] };
          }
          output[reduceIndex].speed.push(speed);
          output[reduceIndex].tt.push(current.travelTime);
        }
        return output;
      }, {});

      if (Object.keys(tmcFiveteenMinIndex).length < 1) {
        resolve(null);
        return;
      }

      const measures = calculator(
        tmc,
        trafficDistribution,
        tmcFiveteenMinIndex
      );

      bar.tick();

      resolve(measures);
    });
  });
}

DownloadTMCAtttributes(STATE).then(tmcs => {
  var testTmcs = [];

  if (process.env.FULL) {
    testTmcs = tmcs.rows; //.filter((d, i) => d.tmc === "120P11204");
  } else if (process.env.START && process.env.END){
    testTmcs = tmcs.rows
      .filter((d,i) => i >= process.env.START && i < process.env.END)
  } else {
    testTmcs = tmcs.rows
      //.filter((d, i) => d.tmc === "120N05397")
      .filter((d, i) => i < 30)
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
    { concurrency: 20 }
  ).then(measures => {
    var output = d3.csvFormat(measures.filter(x => x));
    // console.log(measures)
    let startEnd = process.env.START 
      ? `_${process.env.START}_${process.env.END}`
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
