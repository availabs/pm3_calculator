const getFifteenData = require('./utils/getFifteenData');
const { getSortedMeanTimesForBins } = require('./utils/getSortedMeanTimes');

const lottr = require('./utils/lottr');
const tttr = require('./utils/tttr');

const CalculateTTR = (tmc, tmcFiveteenMinIndex, mean = 'mean') => {
  const months = new Set(['total']);

  // NOTE: getFifteenData mutates the months set, adding months to it.
  const fifteenData = getFifteenData(tmcFiveteenMinIndex, months);

  const measures = [...months].reduce(
    (acc, m) => {
      const sortedMeanTimesForBins = getSortedMeanTimesForBins({
        fifteenData,
        monthClause:
          m !== 'total' ? d => d.dateTime.getMonth() === +m : () => true,
        mean
      });

      const monthKey = m === 'total' ? '' : `_${+m + 1}`;

      Object.entries(lottr(sortedMeanTimesForBins)).forEach(
        ([bin, measure]) => {
          acc.lottr[`${bin}${monthKey}`] = measure;
        }
      );

      Object.entries(tttr(sortedMeanTimesForBins)).forEach(([bin, measure]) => {
        acc.tttr[`${bin}${monthKey}`] = measure;
      });

      return acc;
    },
    { lottr: {}, tttr: {} }
  );

  return measures;
};

module.exports = CalculateTTR;
