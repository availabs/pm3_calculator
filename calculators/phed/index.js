/* eslint camelcase: 0 */

const TRAFFIC_TYPES = require('./constants/TRAFFIC_TYPES');
const DEFAULT_MEAN_TYPE = require('./constants/DEFAULT_MEAN_TYPE');

const calculateAllPHED = require('./calculateAllPHED');

const calculatePHED = (
  tmcAttributes,
  tmcFiveteenMinIndex,
  distroArray,
  time = 12,
  mean = DEFAULT_MEAN_TYPE
) => {
  const data = {};
  TRAFFIC_TYPES.forEach(tt => {
    const {
      vehicle_delay,
      delay,
      vehicle_delay_all,
      delay_all
    } = calculateAllPHED(
      tmcAttributes,
      tmcFiveteenMinIndex,
      distroArray,
      time,
      mean,
      tt
    );
    Object.assign(data, vehicle_delay, delay, vehicle_delay_all, delay_all);
  });

  return data;
};

module.exports = calculatePHED;
