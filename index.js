#!/usr/bin/env node

const { env } = process;

let Promise = require("bluebird");
let ProgressBar = require("progress");
let fs = require("fs");
let d3 = require("d3-dsv");

const minimist = require("minimist");
const argv = minimist(process.argv.slice(2));

let {
  DownloadTMCData,
  DownloadTMCAtttributes,
  getTrafficDistribution
} = require("./utils/data_retrieval");

let CalculatePHED = require("./calculators/phed");
let CalculateTTR = require("./calculators/ttr");
let CalculateATRI = require("./calculators/atri");
let CalculatePtiTti = require("./calculators/ptitti");
let bar = null;

const toNumerics = o =>
  Object.keys(o).reduce((acc, k) => {
    acc[k] = Number.isFinite(+o[k]) ? parseFloat(o[k]) : o[k];
    return acc;
  }, {});

const {
  SPEED_FILTER = 3,
  DIR = "data/",
  YEAR = 2017,
  STATE = "ny",
  MEAN = "mean",
  TIME = 3 //number of epochs to group
} = toNumerics(Object.assign({}, env, argv));

const CalculateMeasures = function CalculateMeasures(tmc, year) {
  console.time("Calculation");
  var trafficDistribution = getTrafficDistribution(
    tmc.directionality,
    tmc.congestion_level,
    tmc.is_controlled_access,
    TIME
  );
  var dirFactor = +tmc.faciltype > 1 ? 2 : 1;
  tmc.directional_aadt = tmc.aadt / dirFactor;
  return DownloadTMCData(tmc.tmc, year, STATE).then(tmcData => {
    return new Promise(function(resolve, reject) {
      //console.log('get db data?', tmcData.rows)
      var tmcFiveteenMinIndex = tmcData.rows.reduce((output, current) => {
        var reduceIndex =
          current.npmrds_date + "_" + Math.floor(current.epoch / 3);
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
      var phed = CalculatePHED(
        tmc,
        tmcFiveteenMinIndex,
        trafficDistribution,
        TIME,
        MEAN
      );
      var ttr = CalculateTTR(tmc, tmcFiveteenMinIndex, MEAN);
      let atri = CalculateATRI(
        tmc,
        tmcFiveteenMinIndex,
        trafficDistribution,
        TIME,
        MEAN
      );
      let ttipti = CalculatePtiTti(tmc, tmcFiveteenMinIndex, MEAN);
      bar.tick();

      resolve({
        ...tmc,
        ...ttr.lottr,
        ...ttr.tttr,
        ...phed.vehicle_delay,
        ...phed.delay,
        ...atri,
        ...ttipti
      });
    });
  });
  //return trafficDistribution
};

DownloadTMCAtttributes(STATE).then(tmcs => {
  var testTmcs = tmcs.rows //.filter((d, i) => d.tmc === "120P11204");
    .filter((d, i) => i < 30);
  TOTAL = testTmcs.length;
  bar = new ProgressBar("[:bar] :current/:total = :percent  :elapsed/:eta", {
    total: TOTAL
  });
  return Promise.map(
    testTmcs,
    tmc => {
      return CalculateMeasures(tmc, YEAR);
    },
    { concurrency: 20 }
  ).then(measures => {
    var output = d3.csvFormat(measures);
    // console.log(measures)
    fs.writeFile(`${DIR}${STATE}_${YEAR}_${MEAN}_${TIME}.csv`, output, function(
      err
    ) {
      if (err) {
        return console.log(err);
      }
      console.log("The file was saved!");
      return;
    });
    return;
  });
});
