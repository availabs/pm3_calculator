/* eslint camelcase: 0 */

const TRAFFIC_TYPES = require('./constants/TRAFFIC_TYPES');
const DEFAULT_MEAN_TYPE = require('./constants/DEFAULT_MEAN_TYPE');

const calculateAllPHED = require('./calculateAllPHED');

const calculatePHED = (
  tmcAttributes,
  tmcFiveteenMinIndex,
  distroArray,
  time = 12,
  mean = DEFAULT_MEAN_TYPE,
  colMappings = 'avail'
) => {
  const data = {};

  for (let i = 0; i < TRAFFIC_TYPES.length; i += 1) {
    const tt = TRAFFIC_TYPES[i];

    if (colMappings === 'avail' || tt === '') {
      const {
        vehicle_delay,
        delay,
        vehicle_delay_all,
        delay_all,
        phed_meta
      } = calculateAllPHED(
        tmcAttributes,
        tmcFiveteenMinIndex,
        distroArray,
        time,
        mean,
        tt
      );

      if (colMappings === 'avail') {
        // Note: The following has the effect of reducing the depths of
        //       vehicle_delay, delay, vehicle_delay_all, delay_all by 1.
        //       All measures specific to each are assigned directly to data.
        Object.assign(data, vehicle_delay, delay, vehicle_delay_all, delay_all);
      } else {
        const OCC_FAC = tmcAttributes.avg_vehicle_occupancy;
        Object.assign(data, {
          DIR_AADT: phed_meta.dir_aadt,
          OCC_FAC,
          PHED: vehicle_delay.vd_total * OCC_FAC
        });
      }
    }
  }

  return data;
};

module.exports = calculatePHED;
