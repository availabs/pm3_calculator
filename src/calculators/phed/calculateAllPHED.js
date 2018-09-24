/* eslint camelcase: 0 */

const { getAadt } = require('../utils/aadtUtils');

const getFifteenData = require('./utils/getFifteenData');
const getFifteenPeaks = require('./utils/getFifteenPeaks');
const calculateDelays = require('./utils/calculateDelays');
const log = require('../../utils/log');

const delayTypeLabel = 'ff';

const DEFAULT_MEAN_TYPE = require('./constants/DEFAULT_MEAN_TYPE');

const calculateAllPHED = (
  tmcAttributes,
  freeflowTT,
  tmcFiveteenMinIndex,
  trafficDistribution,
  time = 12,
  mean = DEFAULT_MEAN_TYPE,
  trafficType = ''
) => {
  const ttlabel = trafficType ? `_${trafficType}` : '';

  const dirFactor = Math.min(tmcAttributes.faciltype, 2);
  const dir_aadt = getAadt(tmcAttributes, trafficType) / dirFactor;

  const thresholdSpeed_sl = Math.max(tmcAttributes.avg_speedlimit * 0.6, 20);
  const thresholdTravelTime_sl = Math.round(
    tmcAttributes.length / thresholdSpeed_sl * 3600
  );

  const fifteenData_sl = getFifteenData({
    tmcAttributes,
    tmcFiveteenMinIndex,
    dir_aadt,
    trafficDistribution,
    trafficType,
    mean,
    time,
    thresholdTravelTime: thresholdTravelTime_sl
  });

  log.debug({
    calculateAllPHED: {
      tmc: tmcAttributes.tmc,
      tmcFiveteenMinIndexNumEntries: Object.keys(tmcFiveteenMinIndex).length,
      fifteenDataLength: fifteenData_sl.length
    }
  });

  const fifteenPeaks_sl = getFifteenPeaks(fifteenData_sl);

  const fifteenTotal_sl = fifteenData_sl.filter(d => d.vehicle_delay);

  const {
    delay,
    vehicle_delay,
    delay_all,
    vehicle_delay_all
  } = calculateDelays({
    fifteenPeaks: fifteenPeaks_sl,
    fifteenTotal: fifteenTotal_sl,
    ttlabel
  });

  const travelTimeAt20mph = Math.round(tmcAttributes.length / 20 * 3600);
  const thresholdTravelTime_ff = Math.min(freeflowTT / 0.6, travelTimeAt20mph);

  const fifteenData_ff = getFifteenData({
    tmcAttributes,
    tmcFiveteenMinIndex,
    dir_aadt,
    trafficDistribution,
    trafficType,
    mean,
    time,
    thresholdTravelTime: thresholdTravelTime_ff
  });

  const fifteenPeaks_ff = getFifteenPeaks(fifteenData_ff);
  const fifteenTotal_ff = fifteenData_ff.filter(d => d.vehicle_delay);

  const {
    delay: delay_ff,
    vehicle_delay: vehicle_delay_ff,
    delay_all: delay_all_ff,
    vehicle_delay_all: vehicle_delay_all_ff
  } = calculateDelays({
    fifteenPeaks: fifteenPeaks_ff,
    fifteenTotal: fifteenTotal_ff,
    ttlabel,
    delayTypeLabel
  });

  const phed_meta = {
    dir_aadt
  };

  return {
    delay,
    vehicle_delay,
    delay_all,
    vehicle_delay_all,
    delay_ff,
    vehicle_delay_ff,
    delay_all_ff,
    vehicle_delay_all_ff,
    phed_meta
  };
};

module.exports = calculateAllPHED;
