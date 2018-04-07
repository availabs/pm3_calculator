const CalculatePHED = require('./phed');
const CalculateTTR = require('./ttr');
const CalculateATRI = require('./atri');
const CalculatePtiTti = require('./ptitti');
const CalculateFreeFlow = require('./freeflow');

function aggregateMeasureCalculator({ TIME, MEAN }) {
  return function(tmcAttrs, trafficDistribution, tmcFiveteenMinIndex) {
    const phed = CalculatePHED(
      tmcAttrs,
      tmcFiveteenMinIndex,
      trafficDistribution,
      TIME,
      MEAN
    );

    const ttr = CalculateTTR(tmcAttrs, tmcFiveteenMinIndex, MEAN);

    const atri = CalculateATRI(
      tmcAttrs,
      tmcFiveteenMinIndex,
      trafficDistribution,
      TIME,
      MEAN
    );

    const ttipti = CalculatePtiTti(tmcAttrs, tmcFiveteenMinIndex, MEAN);

    const freeflow = CalculateFreeFlow(tmcAttrs, tmcFiveteenMinIndex);

    return {
      ...tmcAttrs,
      ...ttr.lottr,
      ...ttr.tttr,
      ...phed.vehicle_delay,
      ...phed.delay,
      ...atri,
      ...ttipti,
      ...freeflow
    };
  };
}

module.exports = aggregateMeasureCalculator;
