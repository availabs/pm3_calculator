const percentile = require("percentile");
const concat = require("./utils/concat");

const CalculateFreeFlow = (tmcAtts, tmcFifteenMinIndex) => {
  let TTs = Object.keys(tmcFifteenMinIndex).reduce((acc, k) => {
    let tts = tmcFifteenMinIndex[k].tt;
    concat(acc, tts);
    return acc;
  }, []);
  let freeflowTT = percentile(30, TTs);
  console.log(tmcAtts.tmc, freeflowTT);
  return {
    freeflowTT
  };
};

module.exports = CalculateFreeFlow;
