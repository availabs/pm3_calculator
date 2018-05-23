/* eslint no-unused-vars: 0 */
/* eslint camelcase: 0 */
/* eslint no-return-assign: 0 */
/* eslint no-param-reassign: 0 */
/* eslint no-shadow: 0 */

const d3 = require('d3-array');
const precisionRound = require('./utils/precisionRound');

const WEEKDAYS = [1, 2, 3, 4, 5];
const WEEKENDS = [0, 6];

const CalculateTTR = function CalculateLottr(
  tmc,
  tmcFiveteenMinIndex,
  mean = 'mean'
) {
  const months = {};
  const fifteenData = Object.keys(tmcFiveteenMinIndex).map((key, i) => {
    const epoch = key.split('_')[1];
    let hour = Math.floor(epoch / 4).toString();
    hour = hour.length === 1 ? `0${hour}` : hour;
    let min = ((epoch % 4) * 15).toString();
    min = min.length === 1 ? `0${min}` : min;
    const dateString = key.split('_')[0];
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const yearMonthDay = `${year}-${month}-${day}`;
    const dateTime = new Date(`${yearMonthDay}T${hour}:${min}:00`);
    months[dateTime.getMonth()] = true;

    const sum_tt = tmcFiveteenMinIndex[key].tt.reduce((a, b) => (a += b));
    const hsum_tt = tmcFiveteenMinIndex[key].tt.reduce(
      (a, b) => (a += 1 / b),
      0
    );
    const len = tmcFiveteenMinIndex[key].tt.length;
    const hmean = hsum_tt;
    let mean = sum_tt;
    mean = sum_tt / len;

    return {
      dateTime,
      epoch,
      hmean,
      mean
    };
  });
  const monthvals = Object.keys(months).map(x => +x);
  monthvals.push('total');
  function numSort(a, b) {
    return +a - +b;
  }
  const lottr = scores =>
    precisionRound(d3.quantile(scores, 0.8) / d3.quantile(scores, 0.5), 2);
  const tttr = scores =>
    precisionRound(d3.quantile(scores, 0.95) / d3.quantile(scores, 0.5), 2);

  const measures = monthvals.reduce((acc, m) => {
    const month_clause =
      m !== 'total' ? d => d.dateTime.getMonth() === m : d => true;
    const amPeak = fifteenData
      .filter(
        d =>
          WEEKDAYS.includes(d.dateTime.getDay()) &&
          (d.epoch >= 24 && d.epoch < 40) &&
          month_clause(d)
      )
      .map(d => d[mean])
      .sort(numSort);

    const offPeak = fifteenData
      .filter(
        d =>
          WEEKDAYS.includes(d.dateTime.getDay()) &&
          (d.epoch >= 40 && d.epoch < 64) &&
          month_clause(d)
      )
      .map(d => d[mean])
      .sort(numSort);

    const pmPeak = fifteenData
      .filter(
        d =>
          WEEKDAYS.includes(d.dateTime.getDay()) &&
          (d.epoch >= 64 && d.epoch < 80) &&
          month_clause(d)
      )
      .map(d => d[mean])
      .sort(numSort);

    const weekendPeak = fifteenData
      .filter(
        d =>
          WEEKENDS.includes(d.dateTime.getDay()) &&
          (d.epoch >= 24 && d.epoch < 80) &&
          month_clause(d)
      )
      .map(d => d[mean])
      .sort(numSort);

    const overnightPeak = fifteenData
      .filter(
        d =>
          WEEKDAYS.includes(d.dateTime.getDay()) &&
          (d.epoch < 24 || d.epoch > 80) &&
          month_clause(d)
      )
      .map(d => d[mean])
      .sort(numSort);
    acc.lottr = acc.lottr || {};
    acc.tttr = acc.tttr || {};
    const month_key = m === 'total' ? '' : `_${m + 1}`;
    acc.lottr[`lottr_am${month_key}`] = lottr(amPeak);
    acc.lottr[`lottr_off${month_key}`] = lottr(offPeak);
    acc.lottr[`lottr_pm${month_key}`] = lottr(pmPeak);
    acc.lottr[`lottr_weekend${month_key}`] = lottr(weekendPeak);

    acc.tttr[`tttr_am${month_key}`] = tttr(amPeak);
    acc.tttr[`tttr_off${month_key}`] = tttr(offPeak);
    acc.tttr[`tttr_pm${month_key}`] = tttr(pmPeak);
    acc.tttr[`tttr_weekend${month_key}`] = tttr(weekendPeak);
    acc.tttr[`tttr_overnight${month_key}`] = tttr(overnightPeak);

    return acc;
  }, {});
  // console.log('overnightPeak')
  // console.log(overnightPeak)
  // console.log(d3.quantile(overnightPeak, 0.95 ), d3.quantile(overnightPeak, 0.5),d3.quantile(overnightPeak, 0.8 ) / d3.quantile(overnightPeak, 0.5))
  // var someData = fifteenData
  // 	.map(d => d[mean])
  // 	.sort()

  // someData = offPeak
  // console.log(JSON.stringify(someData))
  // console.log('-------------------------')
  // console.log('extent', d3.extent(someData))
  // console.log('mean', d3.mean(someData))
  // console.log('median', d3.median(someData))
  // console.log('variance', d3.variance(someData))
  // console.log('deviation', d3.deviation(someData))
  // console.log('-------------------------')

  // console.log('am', d3.quantile(amPeak, 0.5), d3.quantile(amPeak, 0.8 ), d3.quantile(amPeak, 0.8 ) / d3.quantile(amPeak, 0.5))
  // console.log('off', d3.quantile(offPeak, 0.5), d3.quantile(offPeak, 0.8 ), d3.quantile(offPeak, 0.8 ) / d3.quantile(offPeak, 0.5))
  // console.log('pm', d3.quantile(pmPeak, 0.5), d3.quantile(pmPeak, 0.8 ), d3.quantile(pmPeak, 0.8 ) / d3.quantile(pmPeak, 0.5))
  // console.log('weekend', d3.quantile(weekendPeak, 0.5), d3.quantile(weekendPeak, 0.8 ) ,d3.quantile(weekendPeak, 0.8 ) / d3.quantile(weekendPeak, 0.5))

  return {
    ...measures
    // lottr: {
    //   lottr_am: precisionRound(
    //     d3.quantile(amPeak, 0.8) / d3.quantile(amPeak, 0.5),
    //     2
    //   ),
    //   lottr_off: precisionRound(
    //     d3.quantile(offPeak, 0.8) / d3.quantile(offPeak, 0.5),
    //     2
    //   ),
    //   lottr_pm: precisionRound(
    //     d3.quantile(pmPeak, 0.8) / d3.quantile(pmPeak, 0.5),
    //     2
    //   ),
    //   lottr_weekend: precisionRound(
    //     d3.quantile(weekendPeak, 0.8) / d3.quantile(weekendPeak, 0.5),
    //     2
    //   )
    // },
    // tttr: {
    //   tttr_am: precisionRound(
    //     d3.quantile(amPeak, 0.95) / d3.quantile(amPeak, 0.5),
    //     2
    //   ),
    //   tttr_off: precisionRound(
    //     d3.quantile(offPeak, 0.95) / d3.quantile(offPeak, 0.5),
    //     2
    //   ),
    //   tttr_pm: precisionRound(
    //     d3.quantile(pmPeak, 0.95) / d3.quantile(pmPeak, 0.5),
    //     2
    //   ),
    //   tttr_overnight: precisionRound(
    //     d3.quantile(overnightPeak, 0.95) / d3.quantile(overnightPeak, 0.5),
    //     2
    //   ),
    //   tttr_weekend: precisionRound(
    //     d3.quantile(weekendPeak, 0.95) / d3.quantile(weekendPeak, 0.5),
    //     2
    //   )
    // }
  };
};
module.exports = CalculateTTR;
