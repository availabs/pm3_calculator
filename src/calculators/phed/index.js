/* eslint camelcase: 0 */

const TRAFFIC_TYPES = require('./constants/TRAFFIC_TYPES');
const DEFAULT_MEAN_TYPE = require('./constants/DEFAULT_MEAN_TYPE');

const calculateAllPHED = require('./calculateAllPHED');

const calculatePHED = (
  tmcAttributes,
  freeflowTT,
  tmcFiveteenMinIndex,
  distroArray,
  time = 12,
  mean = DEFAULT_MEAN_TYPE,
  colMappings = 'avail'
) => {
  // // For testing, serialize the argument params.
  // require('fs').writeFileSync(
  // '/tmp/calculatePHED.parameters.120P04340.json',
  // JSON.stringify([
  // tmcAttributes,
  // tmcFiveteenMinIndex,
  // distroArray,
  // time,
  // mean,
  // colMappings
  // ])
  // );
  const data = {};

  for (let i = 0; i < TRAFFIC_TYPES.length; i += 1) {
    const tt = TRAFFIC_TYPES[i];

    if (colMappings === 'avail' || tt === '') {
      const {
        delay,
        vehicle_delay,
        delay_all,
        vehicle_delay_all,
        delay_ff,
        vehicle_delay_ff,
        delay_all_ff,
        vehicle_delay_all_ff,
        phed_meta
      } = calculateAllPHED(
        tmcAttributes,
        freeflowTT,
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
        Object.assign(
          data,
          vehicle_delay,
          delay,
          vehicle_delay_all,
          delay_all,
          delay_ff,
          vehicle_delay_ff,
          delay_all_ff,
          vehicle_delay_all_ff,
          {
            dir_aadt: phed_meta.dir_aadt,
            // FIXME: This is a hack. Instead, make the code using this value
            //        refer to a consistent property name.
            directional_aadt: phed_meta.dir_aadt
          }
        );
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
