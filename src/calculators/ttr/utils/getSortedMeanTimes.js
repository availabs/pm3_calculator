const WEEKDAYS = [1, 2, 3, 4, 5];
const WEEKENDS = [0, 6];

function numSort(a, b) {
  return +a - +b;
}

const getFilteredSortedMeanTimes = ({ fifteenData, filter, mean }) =>
  fifteenData
    .filter(filter)
    .map(d => d[mean])
    .sort(numSort);

const getAMPeakSortedMeanTimes = ({ fifteenData, monthClause, mean }) =>
  getFilteredSortedMeanTimes({
    fifteenData,
    filter: d =>
      WEEKDAYS.includes(d.dateTime.getDay()) &&
      (d.epoch >= 24 && d.epoch < 40) &&
      monthClause(d),
    mean
  });

const getOffPeakSortedMeanTimes = ({ fifteenData, monthClause, mean }) =>
  getFilteredSortedMeanTimes({
    fifteenData,
    filter: d =>
      WEEKDAYS.includes(d.dateTime.getDay()) &&
      (d.epoch >= 40 && d.epoch < 64) &&
      monthClause(d),
    mean
  });

const getPMPeakSortedMeanTimes = ({ fifteenData, monthClause, mean }) =>
  getFilteredSortedMeanTimes({
    fifteenData,
    filter: d =>
      WEEKDAYS.includes(d.dateTime.getDay()) &&
      (d.epoch >= 64 && d.epoch < 80) &&
      monthClause(d),
    mean
  });

const getWeekendPeakSortedMeanTimes = ({ fifteenData, monthClause, mean }) =>
  getFilteredSortedMeanTimes({
    fifteenData,
    filter: d =>
      WEEKENDS.includes(d.dateTime.getDay()) &&
      (d.epoch >= 24 && d.epoch < 80) &&
      monthClause(d),
    mean
  });

const getOvernightPeakSortedMeanTimes = ({ fifteenData, monthClause, mean }) =>
  getFilteredSortedMeanTimes({
    fifteenData,
    filter: d =>
      (d.epoch < 24 || d.epoch > 80) &&
      monthClause(d),
    mean
  });

const getSortedMeanTimesForBins = sortedMeanTimesParams => ({
  amPeakSortedMeanTimes: getAMPeakSortedMeanTimes(sortedMeanTimesParams),
  offPeakSortedMeanTimes: getOffPeakSortedMeanTimes(sortedMeanTimesParams),
  pmPeakSortedMeanTimes: getPMPeakSortedMeanTimes(sortedMeanTimesParams),
  weekendPeakSortedMeanTimes: getWeekendPeakSortedMeanTimes(
    sortedMeanTimesParams
  ),
  overnightPeakSortedMeanTimes: getOvernightPeakSortedMeanTimes(
    sortedMeanTimesParams
  )
});

module.exports = {
  getAMPeakSortedMeanTimes,
  getPMPeakSortedMeanTimes,
  getOffPeakSortedMeanTimes,
  getWeekendPeakSortedMeanTimes,
  getOvernightPeakSortedMeanTimes,
  getSortedMeanTimesForBins
};
