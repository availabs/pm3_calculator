#!/usr/bin/env node

let {
  DownloadTMCDataHERE,
  DownloadTMCAtttributes,
  getTrafficDistribution,
  DownloadHereToInrixMap
} = require('./utils/data_retrieval');

const { env } = process;

let Promise = require('bluebird');
let ProgressBar = require('progress');
let fs = require('fs');
let d3 = require('d3-dsv');

const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));

const AggregateMeasureCalculator = require('./calculators/aggregatorMeasureCalculator');
const fiveteenMinIndexer = require('./calculators/fiveteenMinIndexer');

let bar = null;

const toNumerics = o =>
  Object.keys(o).reduce((acc, k) => {
    acc[k] = Number.isFinite(+o[k]) ? parseFloat(o[k]) : o[k];
    return acc;
  }, {});

const {
  SPEED_FILTER = 3,
  DIR = 'data/',
  YEAR = process.env.YEAR || 2016,
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

  return DownloadTMCDataHERE(tmc.tmc, year, STATE).then(tmcData => {
    return new Promise(function(resolve, reject) {
      const tmcFiveteenMinIndex = fiveteenMinIndexer(tmc, tmcData.rows, {
        SPEED_FILTER
      });

      bar.tick();

      if (Object.keys(tmcFiveteenMinIndex || {}).length < 1) {
        return resolve(null);
      }

      const measures = calculator(
        tmc,
        trafficDistribution,
        tmcFiveteenMinIndex
      );

      return resolve(measures);
    });
  });
}

DownloadTMCAtttributes(STATE).then(inrix_tmcs => {
  var testTmcs = inrix_tmcs.rows;
  var tmcLookup = testTmcs.reduce((output, curr) => {
    output[curr.tmc] = curr;
    return output;
  }, {});
  //console.log('we get inrix tmcs', tmcLookup)
  DownloadHereToInrixMap().then(here_tmcs => {
    var HereTmcs = here_tmcs.rows.map(tmc => {
      //let bestDifference = Infinity;

      let inrix_tmc = tmc.inrix_tmcs.split(',')[0];
      // .reduce((final, curr) => {
      // 	let inrixSpeedLimit = tmcLookup[curr].avg_speedlimit
      // 	let speedDifference = Math.abs(inrixSpeedLimit tmc
      // 	if(inrixSpeedLimit)

      // },null)
      //console.log('here tmcs', tmc.avg_speedlimit, tmcLookup[inrix_tmc].avg_speedlimit, tmc.avg_speedlimit -  tmcLookup[inrix_tmc].avg_speedlimit )
      let output = Object.assign({}, tmcLookup[inrix_tmc]);
      output.tmc = tmc.here;
      output.length = tmc.length;
      output.is_interstate = tmc.is_interstate;
      return output;
    });
    //.filter((d,i) => i < 1)
    TOTAL = HereTmcs.length;
    bar = new ProgressBar('[:bar] :current/:total = :percent  :elapsed/:eta', {
      total: TOTAL
    });

    const calculator = AggregateMeasureCalculator({ TIME, MEAN });
    const calculateMeasures = CalculateMeasures.bind({ calculator });

    return Promise.map(
      HereTmcs,
      tmc => {
        return calculateMeasures(tmc, YEAR);
      },
      { concurrency: 20 }
    ).then(measures => {
      var output = d3.csvFormat(measures);
      // console.log(measures)
      fs.writeFile(
        `${DIR}${STATE}_${YEAR}_${MEAN}_${TIME}.csv`,
        output,
        function(err) {
          if (err) {
            return console.log(err);
          }
          console.log('The file was saved!');
          return;
        }
      );
      return;
    });
  });
});
