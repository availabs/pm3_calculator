/*
 * This module is a clone of the same named function 
 *   found in utils/data_retrieval.js as of
 *   git commit 3fec2e9e8b9c54dd7a11f197d85ad4f6ce202654.
 *
 * The sole difference is that the CATLAB distribution
 *   is the only supported distribution.  This change
 *   made the group and type function parameters irrelevant.
 *
 * The reason for cloning the original function
 *   is to maintain consistent traffic distributions
 *   for testing the phed and ptitti across git commits.
 * For our Golden Master tests of the the calculator functions,
 *   we need consistent inputs to functions, even if those
 *   inputs are not consistent with what the tested function
 *   version would have recieved when it was at HEAD.
 */

const traffic_distribution_cattlab = require('./traffic_distribution_cattlab.json');

const getTrafficDistribution = function getTrafficDistribution(
  directionality,
  congestion_level,
  is_controlled_access
) {
  let distroKey =
    'WEEKDAY' +
    '_' +
    (congestion_level
      ? congestion_level.replace(' ', '_')
      : 'NO2LOW_CONGESTION') +
    '_' +
    (directionality ? directionality.replace(' ', '_') : 'EVEN_DIST') +
    '_' +
    (is_controlled_access ? 'FREEWAY' : 'NONFREEWAY');

  return traffic_distribution_cattlab[distroKey].reduce(
    (output, current, current_index) => {
      if (!output[current_index]) {
        output[current_index] = 0;
      }

      output[current_index] += current;

      return output;
    },
    []
  );
};

module.exports = getTrafficDistribution;
