const CalculatePHED = require('./phed');
const CalculateTTR = require('./ttr');
const CalculateATRI = require('./atri');
const CalculatePtiTti = require('./ptitti');
const CalculateFreeFlow = require('./freeflow');

const aggregateMeasureCalculator = ({ TIME, MEAN }) => (
  tmcAttrs,
  trafficDistribution,
  tmcFiveteenMinIndex
) => {
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
    ...phed,
    ...atri,
    ...ttipti,
    ...freeflow,
    // Need to enclose the bounding box in quotes
    //   because the value contains a comma.
    bounding_box: `"${tmcAttrs.bounding_box}"`
  };
};

module.exports = aggregateMeasureCalculator;
