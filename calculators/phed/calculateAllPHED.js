/* eslint camelcase: 0 */

const { getAadt } = require('../utils/aadtUtils');

const getFifteenData = require('./utils/getFifteenData');
const getFifteenPeaks = require('./utils/getFifteenPeaks');
const calculateDelays = require('./utils/calculateDelays');
const log = require('../../utils/log');

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

  const dirFactor = Math.min(tmcAttributes.faciltype, 2);
  const dir_aadt = getAadt(tmcAttributes, trafficType) / dirFactor;

  const fifteenData = getFifteenData({
    tmcAttributes,
    tmcFiveteenMinIndex,
    dir_aadt,
    distroArray,
    trafficType,
    mean,
    time
  });

  log.debug({
    calculateAllPHED: {
      tmc: tmcAttributes.tmc,
      tmcFiveteenMinIndexNumEntries: Object.keys(tmcFiveteenMinIndex).length,
      fifteenDataLength: fifteenData.length
    }
  });

  const fifteenPeaks = getFifteenPeaks(fifteenData);

  const fifteenTotal = fifteenData.filter(d => d.vehicle_delay);

  const {
    delay,
    vehicle_delay,
    delay_all,
    vehicle_delay_all
  } = calculateDelays({ fifteenPeaks, fifteenTotal, ttlabel });

  const phed_meta = {
    dir_aadt
  };

  return {
    delay,
    vehicle_delay,
    delay_all,
    vehicle_delay_all,
    phed_meta
  };
};

module.exports = calculateAllPHED;
