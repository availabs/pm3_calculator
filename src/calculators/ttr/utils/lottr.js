/* eslint camelcase: 0 */

const d3 = require('d3-array');
const precisionRound = require('../../utils/precisionRound');

const computeScore = (sortedMeanTimes, binName) => {
  const tt50pct = d3.quantile(sortedMeanTimes, 0.5);
  const tt80pct = d3.quantile(sortedMeanTimes, 0.8);

  return {
    [`tt_${binName}50pct`]: tt50pct,
    [`tt_${binName}80pct`]: tt80pct,
    [`lottr_${binName}`]: precisionRound(tt80pct / tt50pct, 2)
  };
};

const lottr = ({
  amPeakSortedMeanTimes,
  offPeakSortedMeanTimes,
  pmPeakSortedMeanTimes,
  weekendPeakSortedMeanTimes
}) => ({
  ...computeScore(amPeakSortedMeanTimes, 'amp'),
  ...computeScore(offPeakSortedMeanTimes, 'midd'),
  ...computeScore(pmPeakSortedMeanTimes, 'pmp'),
  ...computeScore(weekendPeakSortedMeanTimes, 'we')
});

module.exports = lottr;
