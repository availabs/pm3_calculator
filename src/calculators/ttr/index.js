const getFifteenData = require('./utils/getFifteenData');
const { getSortedMeanTimesForBins } = require('./utils/getSortedMeanTimes');

const availFieldNameMappings = require('./constants/availFieldNameMappings');
const fhwaFieldNameMappings = require('./constants/fhwaFieldNameMappings');

const lottr = require('./utils/lottr');
const tttr = require('./utils/tttr');

const CalculateTTR = (
  tmc,
  tmcFiveteenMinIndex,
  mean = 'mean',
  colMappings = 'avail'
) => {
  const months = new Set(['total']);

  // NOTE: getFifteenData mutates the months set, adding months to it.
  const fifteenData = getFifteenData(tmcFiveteenMinIndex, months);

  const measures = [...months].reduce(
    (acc, m) => {
      // FHWA output only for yearly
      if (m !== 'total' && colMappings !== 'avail') {
        return acc;
      }

      const sortedMeanTimesForBins = getSortedMeanTimesForBins({
        fifteenData,
        monthClause:
          m !== 'total' ? d => d.dateTime.getMonth() === +m : () => true,
        mean
      });

      const monthKey = m === 'total' ? '' : `_${+m + 1}`;
      const mappings =
        colMappings === 'avail'
          ? availFieldNameMappings
          : fhwaFieldNameMappings;

      Object.entries(lottr(sortedMeanTimesForBins)).forEach(
        ([bin, measure]) => {
          const binName = mappings[bin];
          // NOTE: This is the filtering mechanism.
          //       If the bin is not in the mappings,
          //       it is excluded from the output.
          if (binName) {
            acc.lottr[`${binName}${monthKey}`] = measure;
          }
        }
      );

      Object.entries(tttr(sortedMeanTimesForBins)).forEach(([bin, measure]) => {
        const binName = mappings[bin];
        // NOTE: This is the filtering mechanism.
        //       If the bin is not in the mappings,
        //       it is excluded from the output.
        if (binName) {
          acc.tttr[`${binName}${monthKey}`] = measure;
        }
      });

      return acc;
    },
    { lottr: {}, tttr: {} }
  );

  return measures;
};

module.exports = CalculateTTR;
