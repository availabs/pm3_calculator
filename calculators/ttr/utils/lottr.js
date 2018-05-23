const d3 = require('d3-array');
const precisionRound = require('../../utils/precisionRound');

const computeScore = sortedMeanTimes =>
  precisionRound(
    d3.quantile(sortedMeanTimes, 0.8) / d3.quantile(sortedMeanTimes, 0.5),
    2
  );

const lottr = ({
  amPeakSortedMeanTimes,
  offPeakSortedMeanTimes,
  pmPeakSortedMeanTimes,
  weekendPeakSortedMeanTimes
}) => ({
  lottr_am: computeScore(amPeakSortedMeanTimes),
  lottr_off: computeScore(offPeakSortedMeanTimes),
  lottr_pm: computeScore(pmPeakSortedMeanTimes),
  lottr_weekend: computeScore(weekendPeakSortedMeanTimes)
});

module.exports = lottr;
