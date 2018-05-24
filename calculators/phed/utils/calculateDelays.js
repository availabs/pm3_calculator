/* eslint camelcase: 0 */

const arraySum = require('./arraySum');

const precisionRound = require('../../utils/precisionRound');

const calculateDelays = ({ fifteenPeaks, fifteenTotal, ttlabel }) => {
  const delay = {};
  const vehicle_delay = {};
  const delay_all = {};
  const vehicle_delay_all = {};

  // compute the monthly delays
  for (let month = 0; month < 12; month += 1) {
    const raw_data = fifteenPeaks.filter(d => d.dateTime.getMonth() === month);
    const raw_all_data = fifteenTotal.filter(
      d => d.dateTime.getMonth() === month
    );

    const cur_delay = raw_data.reduce((sum, cur) => sum + +cur.delay, 0);
    delay[`d${ttlabel}_${month + 1}`] = precisionRound(cur_delay, 3);

    const curr_vehicle_delay = raw_data.reduce(
      (sum, cur) => sum + +cur.vehicle_delay,
      0
    );
    vehicle_delay[`vd${ttlabel}_${month + 1}`] = precisionRound(
      curr_vehicle_delay,
      3
    );

    const cur_all_delay = arraySum(raw_all_data, 'delay');
    const cur_all_vehicle_delay = arraySum(raw_all_data, 'vehicle_delay');

    const key = `${month + 1}`;

    delay_all[`td${ttlabel}_${key}`] = precisionRound(cur_all_delay, 3);
    vehicle_delay_all[`tvd${ttlabel}_${key}`] = precisionRound(
      cur_all_vehicle_delay,
      3
    );
  }

  // compute the yearly delays
  delay_all[`td${ttlabel}_total`] = precisionRound(
    arraySum(fifteenTotal, 'delay'),
    3
  );

  vehicle_delay_all[`tvd${ttlabel}_total`] = precisionRound(
    arraySum(fifteenTotal, 'vehicle_delay'),
    3
  );

  vehicle_delay[`vd${ttlabel}_total`] = precisionRound(
    arraySum(fifteenPeaks, 'vehicle_delay'),
    3
  );

  delay[`d${ttlabel}_total`] = precisionRound(
    arraySum(fifteenPeaks, 'delay'),
    3
  );

  return {
    delay,
    vehicle_delay,
    delay_all,
    vehicle_delay_all
  };
};

module.exports = calculateDelays;
