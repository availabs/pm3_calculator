const fiveteenMinIndexer = require('../calculators/fiveteenMinIndexer');
const getTMCFromDatabase = require('../tasks/getTestData/getTMCFromDatabase');
const { getTMCDataFromCSV } = require('../tasks/getTestData/getTMCFromCSV');
const { shutItDown } = require('../utils/db_service');

// const CalculatePHED = require('../calculators/phed');
// const AggregateMeasureCalculator = require('../calculators/aggregatorMeasureCalculator');

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

afterAll(() => {
  // close the DB connections so Jest doesn't hang.
  shutItDown();
});

describe('DB data vs CSV data Test Suite (Single TMC)', () => {
  test('DB data and CSV data lengths equal', async () => {
    const dbData = await getTestDataFromDB();
    const csvData = await getTestDataFromCSV();
    expect(dbData.data.length).toEqual(csvData.length);
  });

  test('DB data and CSV data contain same epochs', async () => {
    const dbData = await getTestDataFromDB();
    const csvData = await getTestDataFromCSV();

    const dbEpochs = dbData.data
      .map(({ npmrds_date: date, epoch }) => `${date}${`00${epoch}`.slice(-3)}`)
      .sort();
    const csvEpochs = csvData
      .map(({ date, epoch }) => `${date}${`00${epoch}`.slice(-3)}`)
      .sort();

    expect(dbEpochs).toEqual(csvEpochs);
  });

  test('DB data and CSV travel times are numbers', async () => {
    const dbData = await getTestDataFromDB();
    const csvData = await getTestDataFromCSV();

    const { travelTime: dbTime } = dbData.data.find(elem => elem.travelTime);
    const { travel_time_all_vehicles: csvTime } = csvData.find(
      elem => elem.travel_time_all_vehicles
    );

    expect(typeof dbTime).toBe('number');
    expect(typeof csvTime).toBe('number');
  });

  test('DB data and CSV data contain same travel times', async () => {
    const dbData = await getTestDataFromDB();
    const csvData = await getTestDataFromCSV();

    const dbTravelTimes = dbData.data.reduce(
      (acc, { npmrds_date: date, epoch, travelTime: tt }) => {
        const k = `${date}${`00${epoch}`.slice(-3)}`;
        acc[k] = tt;
        return acc;
      },
      {}
    );

    const csvTravelTimes = csvData.reduce(
      (acc, { date, epoch, travel_time_all_vehicles: tt }) => {
        const k = `${date}${`00${epoch}`.slice(-3)}`;
        acc[k] = tt;
        return acc;
      },
      {}
    );

    const keys = new Set(
      Array.prototype.concat(
        Object.keys(dbTravelTimes),
        Object.keys(csvTravelTimes)
      )
    );

    // NOTE: By testing one by one, we avoid Jest hanging because of massive object diff
    [...keys]
      .sort()
      .forEach(k => expect(dbTravelTimes[k]).toEqual(csvTravelTimes[k]));
  });

  test('fiveteenMinIndexer output same for DB data and CSV data', async () => {
    const dbData = await getTestDataFromDB();
    const csvData = await getTestDataFromCSV();

    const dbDataIndexed = fiveteenMinIndexer(dbData.attributes, dbData.data);
    const csvDataIndexed = fiveteenMinIndexer(dbData.attributes, csvData);

    const keys = new Set(
      Array.prototype.concat(
        Object.keys(dbDataIndexed),
        Object.keys(csvDataIndexed)
      )
    );

    // NOTE: By testing one by one, we avoid Jest hanging because of massive object diff
    [...keys]
      .sort()
      .forEach(k => expect(dbDataIndexed[k]).toEqual(csvDataIndexed[k]));
  });
});
