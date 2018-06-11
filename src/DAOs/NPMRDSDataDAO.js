/* eslint global-require: 0 */
/* eslint no-param-reassign: 0 */

const {
  ARRAY,
  DATABASE,
  STREAM,
  FILE
} = require('../constants/NPMRDS_DATA_SOURCES');

const { createCSVIterator } = require('../utils/csvStreamIterator');

// NOTE: Below,
//        call to require('../services/dbNPMRDSDataGenerator'),
//        avoids unnecessary DB connection
const {
  generateData: generateDataFromCSV
} = require('../services/csvNPMRDSDataGenerator');

async function* generateNPMRDSData(config) {
  switch (config.npmrdsDataSource) {
    case ARRAY: {
      // For easy testing
      if (!Array.isArray(config.npmrdsDataArray)) {
        throw new Error(
          'When npmrdsDataSource is ARRAY, a npmrdsDataArray is required.'
        );
      }
      yield* generateDataFromCSV(
        Object.assign({}, config, { csvIterator: config.npmrdsDataArray })
      );
      return;
    }

    case DATABASE: {
      // NOTE: This require statement is here to prevent unnecessary DB connections.
      const {
        generateData: generateDataFromDB
      } = require('../services/dbNPMRDSDataGenerator');
      yield* generateDataFromDB(config);
      return;
    }

    case STREAM:
    case FILE: {
      const { csvPath, stream } = config;

      if (config.npmrdsDataSource === FILE && !(csvPath || stream)) {
        throw new Error(
          'When NPMRDS data npmrdsDataSource is FILE, the csvPath config field is required.'
        );
      } else if (config.npmrdsDataSource === 'STREAM' && !stream) {
        throw new Error(
          'When NPMRDS data npmrdsDataSource is STREAM, the stream config field is required.'
        );
      }

      const csvIterator = createCSVIterator(config);

      yield* generateDataFromCSV(Object.assign({}, config, { csvIterator }));
      return;
    }

    case undefined:
      throw new Error('npmrdsDataSource config field is required.');
    default:
      throw new Error('Unrecognized npmrdsDataSource.');
  }
}

module.exports = { generateNPMRDSData };
