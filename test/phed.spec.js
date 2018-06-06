const fiveteenMinIndexer = require('../calculators/fiveteenMinIndexer');
const getTMCFromDatabase = require('../tasks/getTestData/getTMCFromDatabase');
const CalculateTrafficDistFactors = require('../calculators/trafficDistributionFactors');
const CalculatePHED = require('../calculators/phed');
const { getTMCDataFromCSV } = require('../tasks/getTestData/getTMCFromCSV');
const { shutItDown } = require('../utils/db_service');
const { getTrafficDistribution } = require('./../utils/data_retrieval');

const TIME = 12;
const MEAN = 'mean';
const PHED_COL_MAPPINGS = 'avail';
const state = 'ny';
const year = 2017;
// const tmc = '120N05397';
const tmc = '104+04098';

let dbTMCData = null;
let csvTMCData = null;

const getTestDataFromDB = () =>
  new Promise(resolve => {
    if (dbTMCData) {
      resolve(dbTMCData);
    }
    getTMCFromDatabase(state, year, tmc).then(data => {
      dbTMCData = data;
      resolve(data);
    });
  });

const getTestDataFromCSV = async () => {
  if (csvTMCData) {
    return csvTMCData;
  }

  csvTMCData = await getTMCDataFromCSV(state, year, tmc);

  return csvTMCData;
};

const getPHEDIndexJSWay = (attrs, data) => {
  const trafficDistribution = getTrafficDistribution(
    attrs.directionality,
    attrs.congestion_level,
    attrs.is_controlled_access,
    TIME,
    'cattlab'
  );
  const dirFactor = +attrs.faciltype > 1 ? 2 : 1;

  attrs.directional_aadt = attrs.aadt / dirFactor; // eslint-disable-line no-param-reassign

  const tmcFiveteenMinIndex = fiveteenMinIndexer(attrs, data);

  return CalculatePHED(
    attrs,
    tmcFiveteenMinIndex,
    trafficDistribution,
    TIME,
    MEAN,
    PHED_COL_MAPPINGS
  );
};

const getPHEDIndexStreamingJSWay = (attrs, data) => {
  const { congestion_level, directionality } = CalculateTrafficDistFactors({
    attrs,
    data
  });

  // eslint-disable-next-line no-param-reassign
  attrs.congestion_level = congestion_level || attrs.congestion_level;

  // eslint-disable-next-line no-param-reassign
  attrs.directionality = directionality || attrs.directionality;

  const trafficDistribution = getTrafficDistribution(
    attrs.directionality,
    attrs.congestion_level,
    attrs.is_controlled_access,
    TIME,
    'cattlab'
  );

  const tmcFiveteenMinIndex = fiveteenMinIndexer(attrs, data);

  return CalculatePHED(
    attrs,
    tmcFiveteenMinIndex,
    trafficDistribution,
    TIME,
    MEAN,
    PHED_COL_MAPPINGS
  );
};

afterAll(() => {
  // close the DB connections so Jest doesn't hang.
  shutItDown();
});

describe('Calculate PHED Test Suite', () => {
  test('data has one year or less', done => {
    getTestDataFromDB().then(dbData => {
      expect(dbData.data.length).toBeLessThanOrEqual(288 * 365);
      done();
    });
  });

  test('get fiveteen minute index', done => {
    getTestDataFromDB().then(data => {
      const fiveteenMinuteData = fiveteenMinIndexer(data.attributes, data.data);
      // console.log(fiveteenMinuteData)
      expect(Object.keys(fiveteenMinuteData).length).toBeLessThanOrEqual(
        96 * 365
      );
      done();
    });
  });

  test('PHED output nonnull for db data', async () => {
    const { attributes, data } = await getTestDataFromDB();

    const phed = getPHEDIndexJSWay(attributes, data);

    expect(phed).toEqual(expect.anything());
  });

  test('phed output nonnull for csv data', async () => {
    const { attributes: attrs } = await getTestDataFromDB();
    const data = await getTestDataFromCSV();

    const phed = getPHEDIndexStreamingJSWay(attrs, data);

    expect(phed).toEqual(expect.anything());
  });

  test('PHED output same for index.js and index.streaming.js', async () => {
    const { attributes, data: dbData } = await getTestDataFromDB();
    const csvData = await getTestDataFromCSV();

    const indexJsPHED = getPHEDIndexJSWay(attributes, dbData);
    const indexStreamingJsPHED = getPHEDIndexJSWay(attributes, csvData);

    expect(indexStreamingJsPHED).toEqual(indexJsPHED);
  });
});
