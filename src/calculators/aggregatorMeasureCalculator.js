const _ = require('lodash');

const CalculatePHED = require('./phed');
const CalculateTTR = require('./ttr');
const CalculateATRI = require('./atri');
const CalculateATRI_2 = require('./atri.2');
const CalculatePtiTti = require('./ptitti');
const CalculateFreeFlow = require('./freeflow');

const aggregateMeasureCalculator = ({ TIME, MEAN }) => (
  tmcAttrs,
  trafficDistribution,
  tmcFiveteenMinIndex
) => {
  const freeflow = CalculateFreeFlow(tmcAttrs, tmcFiveteenMinIndex);

  const { freeflowTT, freeflowSpeed, freeflowSpeedHMean } = freeflow;

  const ttr = CalculateTTR(tmcAttrs, tmcFiveteenMinIndex, MEAN);

  const atri = CalculateATRI(
    tmcAttrs,
    tmcFiveteenMinIndex,
    trafficDistribution,
    TIME,
    MEAN
  );

  console.error(JSON.stringify(atri, null, 2).slice(0, 1000));

  const atri2_ffspeed = CalculateATRI_2({
    tmcAttrs,
    tmcFiveteenMinIndex,
    trafficDistribution,
    freeflowSpeed,
    ffLabel: 'ffspeed'
  });

  console.error(JSON.stringify(atri2_ffspeed, null, 2).slice(0, 1000));

  const atri2_ffspeedhmean = CalculateATRI_2({
    tmcAttrs,
    tmcFiveteenMinIndex,
    trafficDistribution,
    freeflowSpeed: freeflowSpeedHMean,
    ffLabel: 'ffspeedhmean'
  });

  console.error(JSON.stringify(atri2_ffspeedhmean, null, 2).slice(0, 1000));

  const phed = CalculatePHED(
    tmcAttrs,
    freeflowTT,
    tmcFiveteenMinIndex,
    trafficDistribution,
    TIME,
    MEAN
  );

  const ffPHEDFields = Object.keys(phed).filter(k => /_ff_total$/.test(k));
  const { length } = tmcAttrs;

  const phedFFSpeed = _.chain(
    CalculatePHED(
      tmcAttrs,
      length / freeflowSpeed * 3600,
      tmcFiveteenMinIndex,
      trafficDistribution,
      TIME,
      MEAN
    )
  )
    .pick(ffPHEDFields)
    .mapKeys((v, k) => k.replace(/_ff_total/, '_ffspeed_total'))
    .value();

  const phedFFSpeedHMean = _.chain(
    CalculatePHED(
      tmcAttrs,
      length / freeflowSpeedHMean * 3600,
      tmcFiveteenMinIndex,
      trafficDistribution,
      TIME,
      MEAN
    )
  )
    .pick(ffPHEDFields)
    .mapKeys((v, k) => k.replace(/_ff_total/, '_ffspeedhmean_total'))
    .value();

  const ttipti = CalculatePtiTti(tmcAttrs, tmcFiveteenMinIndex, freeflowTT);

  const ffTIfields = Object.keys(ttipti).filter(k => /_total$/.test(k));

  const ttiptiFFSpeed = _.chain(
    CalculatePtiTti(
      tmcAttrs,
      tmcFiveteenMinIndex,
      length / freeflowSpeed * 3600
    )
  )
    .pick(ffTIfields)
    .mapKeys((v, k) => k.replace(/_total$/, '_ffspeed_total'))
    .value();

  const ttiptiFFSpeedHMean = _.chain(
    CalculatePtiTti(
      tmcAttrs,
      tmcFiveteenMinIndex,
      length / freeflowSpeedHMean * 3600
    )
  )
    .pick(ffTIfields)
    .mapKeys((v, k) => k.replace(/_total$/, '_ffspeedhmean_total'))
    .value();

  return {
    ...tmcAttrs,
    ...ttr.lottr,
    ...ttr.tttr,
    ...phed,
    ...phedFFSpeed,
    ...phedFFSpeedHMean,
    ...atri,
    ...atri2_ffspeed,
    ...atri2_ffspeedhmean,
    ...ttipti,
    ...ttiptiFFSpeed,
    ...ttiptiFFSpeedHMean,
    ...freeflow,
    // Need to enclose the bounding box in quotes
    //   because the value contains a comma.
    bounding_box: `"${tmcAttrs.bounding_box}"`
  };
};

module.exports = aggregateMeasureCalculator;
