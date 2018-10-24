/*
  CalculateATRI
  computes the ATRI score for a given tmc based on the inputted
  time aggregated speed, freeflow,
  aadt(+type), Distribution Factor,

*/
const percentile = require("percentile");
const concat = require("./utils/concat");
const { getAadt } = require("./utils/aadtUtils");
const { speed, speedPV, speedFT } = require("./utils/indexutils");
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

  let months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  let get = { "": speed, speedPV: speedPV, speedFT: speedFT };
  let allSpeeds = { "": [], speedPV: [], speedFT: [] };
  let speedTypes = Object.keys(allSpeeds);
  let monthBins = speedTypes.reduce((tacc, x) => {
    tacc[x] = months.reduce((acc, d) => {
      acc[d] = [];
      return acc;
    }, {});
    return tacc;
  }, {});

  //Cluster the monthly Speeds

  Object.keys(tmcFifteenMinIndex).forEach(k => {
    let month = +k.substring(4, 6);
    speedTypes.forEach(st => {
      let accessor = get[st];
      let speeds = accessor(tmcFifteenMinIndex, k).filter(
        x => x && isFinite(x)
      );
      concat(monthBins[st][month], speeds);
      concat(allSpeeds[st], speeds);
    });
  });

  //Calculate the avg for each month
  let monthAvgs = speedTypes.reduce((tacc, st) => {
    tacc[st] = months.reduce((acc, d) => {
      if (monthBins[st][d].length === 0) return acc;
      acc[d] =
        monthBins[st][d].reduce((acc, s) => acc + s, 0) /
        monthBins[st][d].length;
      return acc;
    }, {});
    return tacc;
  }, {});
  //Calculate Total Avg
  let avgo = speedTypes.reduce((tacc, st) => {
    tacc[st] = Object.keys(monthAvgs[st]).reduce(
      (acc, k) => {
        acc.sum += monthAvgs[st][k] * monthBins[st][k].length;
        acc.len += monthBins[st][k].length;
        return acc;
      },
      { sum: 0, len: 0 }
    );
    return tacc;
  }, {});
  speedTypes.forEach(
    st => (monthAvgs[st]["total"] = avgo[st].sum / avgo[st].len)
  );
  let freeflowSpeed = percentile(70, allSpeeds[""]) || 55;
  let trafficTypes = ["", "truck", "pass"];
  let ttSpeeds = {
    "": "",
    truck: "speedFT",
    pass: "speedPV"
  };
  let data = {};
  trafficTypes.forEach(tt => {
    let DirectionalAADT = getAadt(tmcAtts, tt) / dirFactor;
    let st = ttSpeeds[tt];
    let dd = Object.keys(monthAvgs[st]).reduce((acc, k) => {
      acc[`atri${tt.length ? `_${tt}` : ""}_${k}`] = precisionRound(
        Math.max(freeflowSpeed - monthAvgs[st][k], 0) * DirectionalAADT,
        2
      );
      return acc;
    }, {});
    Object.assign(data, dd);
  });
  //console.log("ATRI", tmcAtts, time, mean, data, distribution);
  return data;
};

module.exports = CalculateATRI;
