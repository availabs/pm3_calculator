const getFifteenData = require('./utils/getFifteenData');
const { getSortedMeanTimesForBins } = require('./utils/getSortedMeanTimes');

const { PASSENGER, TRUCK } = require('./constants/travelTimeTypes');

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

  // NOTE: getFifteenData MUTATES the months set,
  //       ADDING months to it.
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

      const fieldNameMappings =
        colMappings === 'avail'
          ? availFieldNameMappings
          : fhwaFieldNameMappings;

      Object.entries(lottr(sortedMeanTimesForBins)).forEach(
        ([bin, measure]) => {
          const binName = fieldNameMappings[bin];
          if (binName) {
            acc.lottr[`${binName}${monthKey}`] = measure;
          }
        }
      );

      Object.entries(tttr(sortedMeanTimesForBins)).forEach(([bin, measure]) => {
        const binName = fieldNameMappings[bin];
        if (binName) {
          acc.tttr[`${binName}${monthKey}`] = measure;
        }
      });

      if (colMappings === 'avail') {
        const sortedMeanPassengerTimesForBins = getSortedMeanTimesForBins({
          fifteenData,
          monthClause:
            m !== 'total' ? d => d.dateTime.getMonth() === +m : () => true,
          mean,
          vehicleType: PASSENGER
        });

        Object.entries(lottr(sortedMeanPassengerTimesForBins)).forEach(
          ([bin, measure]) => {
            const binName = fieldNameMappings[bin];
            if (binName) {
              acc.lottr[`${binName}_pass${monthKey}`] = measure;
            }
          }
        );

        Object.entries(tttr(sortedMeanPassengerTimesForBins)).forEach(
          ([bin, measure]) => {
            const binName = fieldNameMappings[bin];
            if (binName) {
              acc.tttr[`${binName}_pass${monthKey}`] = measure;
            }
          }
        );

        const sortedMeanTruckTimesForBins = getSortedMeanTimesForBins({
          fifteenData,
          monthClause:
            m !== 'total' ? d => d.dateTime.getMonth() === +m : () => true,
          mean,
          vehicleType: TRUCK
        });

        Object.entries(lottr(sortedMeanTruckTimesForBins)).forEach(
          ([bin, measure]) => {
            const binName = fieldNameMappings[bin];
            if (binName) {
              acc.lottr[`${binName}_truck${monthKey}`] = measure;
            }
          }
        );

        Object.entries(tttr(sortedMeanTruckTimesForBins)).forEach(
          ([bin, measure]) => {
            const binName = fieldNameMappings[bin];
            if (binName) {
              acc.tttr[`${binName}_truck${monthKey}`] = measure;
            }
          }
        );
      }

      return acc;
    },
    { lottr: {}, tttr: {} }
  );

  return measures;
};

module.exports = CalculateTTR;
