const d3 = require('d3-array');
const precisionRound = require('../../utils/precisionRound');

const computeScore = sortedMeanTimes =>
  precisionRound(
    d3.quantile(sortedMeanTimes, 0.95) / d3.quantile(sortedMeanTimes, 0.5),
    2
  );

const tttr = ({
  amPeakSortedMeanTimes,
  offPeakSortedMeanTimes,
  pmPeakSortedMeanTimes,
  weekendPeakSortedMeanTimes,
  overnightPeakSortedMeanTimes
}) => ({
  tttr_am: computeScore(amPeakSortedMeanTimes),
  tttr_off: computeScore(offPeakSortedMeanTimes),
  tttr_pm: computeScore(pmPeakSortedMeanTimes),
  tttr_weekend: computeScore(weekendPeakSortedMeanTimes),
  tttr_overnight: computeScore(overnightPeakSortedMeanTimes)
});

module.exports = tttr;
