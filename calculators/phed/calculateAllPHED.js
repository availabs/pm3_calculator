/* eslint camelcase: 0 */

const getFifteenData = require('./utils/getFifteenData');
const getFifteenPeaks = require('./utils/getFifteenPeaks');
const calculateDelays = require('./utils/calculateDelays');

const DEFAULT_MEAN_TYPE = require('./constants/DEFAULT_MEAN_TYPE');

const calculateAllPHED = (
  tmcAttributes,
  tmcFiveteenMinIndex,
  distroArray,
  time = 12,
  mean = DEFAULT_MEAN_TYPE,
  trafficType = ''
) => {
  const ttlabel = trafficType ? `_${trafficType}` : '';

  const fifteenData = getFifteenData({
    tmcAttributes,
    tmcFiveteenMinIndex,
    distroArray,
    trafficType,
    mean,
    time
  });

  const fifteenPeaks = getFifteenPeaks(fifteenData);

  const fifteenTotal = fifteenData.filter(d => d.vehicle_delay);

  return calculateDelays({ fifteenPeaks, fifteenTotal, ttlabel });
};

module.exports = calculateAllPHED;
