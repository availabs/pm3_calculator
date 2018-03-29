/*
  CalculateATRI
  computes the ATRI score for a given tmc based on the inputted
  time aggregated speed, freeflow,
  aadt(+type), Distribution Factor,

*/
const percentile = require("percentile");
const concat = require("./utils/concat");
const precisionRound = require("./utils/precisionRound");
const CalculateATRI = (
  tmcAtts,
  tmcFifteenMinIndex,
  distribution,
  time = 12,
  mean = "mean"
) => {
  let tmc = tmcAtts.tmc;
  let dirFactor = +tmcAtts.faciltype > 1 ? 2 : 1;
  let DirectionalAADT = tmcAtts.aadt / dirFactor;
  let distroData = distribution;
  //console.log("ATRI", tmcAtts, time, mean);
  let months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  let monthBins = months.reduce((acc, d) => {
    acc[d] = [];
    return acc;
  }, {});

  //Cluster the monthly Speeds
  let monthCounts = {};
  let allSpeeds = [];
  Object.keys(tmcFifteenMinIndex).forEach(k => {
    let month = +k.substring(4, 6);
    monthCounts[month] = monthCounts[month] || 0;
    monthCounts[month] += 1;
    let speeds = tmcFifteenMinIndex[k].speed.filter(x => x && isFinite(x));
    concat(monthBins[month], speeds);
    concat(allSpeeds, speeds);
  });

  //Calculate the avg for each month
  let monthAvgs = months.reduce((acc, d) => {
    if (monthBins[d].length === 0) return acc;
    acc[d] = monthBins[d].reduce((acc, s) => acc + s, 0) / monthBins[d].length;
    return acc;
  }, {});
  //Calculate Total Avg
  let avgo = Object.keys(monthAvgs).reduce(
    (acc, k) => {
      acc.sum += monthAvgs[k] * monthBins[k].length;
      acc.len += monthBins[k].length;
      return acc;
    },
    { sum: 0, len: 0 }
  );
  monthAvgs["total"] = avgo.sum / avgo.len;
  let freeflowSpeed = percentile(70, allSpeeds) || 55;
  let data = Object.keys(monthAvgs).reduce((acc, k) => {
    acc[`atri_${k}`] = precisionRound(
      Math.max(freeflowSpeed - monthAvgs[k], 0) * DirectionalAADT,
      2
    );
    return acc;
  }, {});
  //console.log("ATRI", tmcAtts, time, mean, data, distribution);
  return data;
};

module.exports = CalculateATRI;
