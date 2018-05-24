/* eslint camelcase: 0 */

const d3 = require('d3-array');
const precisionRound = require('../../utils/precisionRound');

const computeScore = (sortedMeanTimes, binName) => {
  const tt50pct = d3.quantile(sortedMeanTimes, 0.5);
  const tt95pct = d3.quantile(sortedMeanTimes, 0.95);

  return {
    [`tt_${binName}50pct`]: tt50pct,
    [`tt_${binName}95pct`]: tt95pct,
    [`tttr_${binName}`]: precisionRound(tt95pct / tt50pct, 2)
  };
};

const tttr = ({
  amPeakSortedMeanTimes,
  offPeakSortedMeanTimes,
  pmPeakSortedMeanTimes,
  weekendPeakSortedMeanTimes,
  overnightPeakSortedMeanTimes
}) => ({
  ...computeScore(amPeakSortedMeanTimes, 'amp'),
  ...computeScore(offPeakSortedMeanTimes, 'midd'),
  ...computeScore(pmPeakSortedMeanTimes, 'pmp'),
  ...computeScore(weekendPeakSortedMeanTimes, 'we'),
  ...computeScore(overnightPeakSortedMeanTimes, 'ovn')
});

module.exports = tttr;
