/*
  CalculatePtiTti
  computes the Planning Time Index and Travel Time Index scores
  for a given tmc based on the inputted
  time aggregated speed, freeflow,
  aadt(+type), Distribution Factor,
*/
const precisionRound = require("./utils/precisionRound");
const concat = require("./utils/concat");
const getDateTime = require("./utils/getDateTime").fifteen;
const percentile = require("percentile");

const log = require('../utils/log')

const CalculatePtiTti = (tmcAtts, tmcFifteenMinIndex, distribution) => {
  let tmc = tmcAtts.tmc;
  let dirFactor = +tmcAtts.faciltype > 1 ? 2 : 1;
  let DirectionalAADT = tmcAtts.aadt / dirFactor;
  let distroData = distribution;

  let months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  let monthBins = months.reduce((acc, d) => {
    acc[d] = { amPeak: [], pmPeak: [] };
    return acc;
  }, {});
  let total = {
    amPeak: [],
    all: [],
    pmPeak: []
  };
  Object.keys(tmcFifteenMinIndex).forEach(k => {
    let month = +k.substring(4, 6);
    let epoch = k.split("_")[1];
    let day = getDateTime(k).getDay();
    placeBin(total, tmcFifteenMinIndex[k].tt);
    if (day > 0 && day < 6)
      placeBinInPeak(epoch, monthBins[month], tmcFifteenMinIndex[k].tt);
  });
  let freeflow = p30(total.all);
  //Calculate the avg for each month
  let monthScores = months.reduce((acc, d) => {
    if (monthBins[d].amPeak.length === 0 && monthBins[d].pmPeak.length === 0) {
      //console.log("MISSING DATA FOR ", tmc, " MONTH: ", d);
      return acc;
    }
    total.amPeak = total.amPeak || [];
    concat(total.amPeak, monthBins[d].amPeak);
    total.pmPeak = total.pmPeak || [];
    concat(total.pmPeak, monthBins[d].pmPeak);
    acc[d] = {
      amTTI: avg(monthBins[d].amPeak) / freeflow,
      pmTTI: avg(monthBins[d].pmPeak) / freeflow,
      amPTI: p95(monthBins[d].amPeak) / freeflow,
      pmPTI: p95(monthBins[d].pmPeak) / freeflow
    };

    return acc;
  }, {});
  monthScores["total"] = {
    amTTI: avg(total.amPeak) / freeflow,
    pmTTI: avg(total.pmPeak) / freeflow,
    amPTI: p95(total.amPeak) / freeflow,
    pmPTI: p95(total.pmPeak) / freeflow
  };

  let data = Object.keys(monthScores).reduce((acc, k) => {
    acc[`amtti_${k}`] = precisionRound(monthScores[k].amTTI, 2);
    acc[`pmtti_${k}`] = precisionRound(monthScores[k].pmTTI, 2);
    acc[`ampti_${k}`] = precisionRound(monthScores[k].amPTI, 2);
    acc[`pmpti_${k}`] = precisionRound(monthScores[k].pmPTI, 2);
    return acc;
  }, {});

  if (Object.keys(tmcFifteenMinIndex).length < 1) {
    log.debug({ tmc, data });
  }

  return data;
};
const avg = arr => arr.reduce((sum, d) => d + sum, 0) / arr.length;
const p30 = arr => percentile(30, arr);
const p95 = arr => percentile(95, arr);
const placeBinInPeak = (bin, store, d) => {
  if (bin >= 24 && bin < 36) {
    concat(store.amPeak, d);
  } else if (bin >= 64 && bin < 76) {
    concat(store.pmPeak, d);
  }
};
const placeBin = (store, d) => {
  concat(store.all, d);
};
module.exports = CalculatePtiTti;
