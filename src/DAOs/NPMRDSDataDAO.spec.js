#!/usr/bin/env node

// https://facebook.github.io/jest/docs/en/mock-functions.html#mocking-modules

// https://github.com/facebook/jest/issues/2666
// https://babeljs.io/docs/plugins/transform-async-generator-functions/

/* eslint no-restricted-syntax: 0 */
/* eslint no-console: 0 */
/* eslint global-require: 0 */

const { join } = require('path');
const { readArray: eventStreamReadArray } = require('event-stream');

const NPMRDS_DATA_SOURCES = require('../constants/NPMRDS_DATA_SOURCES');

const csvNPMRDSDataGeneratorMock = require('../services/csvNPMRDSDataGenerator');
const dbNPMRDSDataGeneratorMock = require('../services/dbNPMRDSDataGenerator');

const csvStreamIteratorMock = require('../utils/csvStreamIterator');

const { generateNPMRDSData } = require('../DAOs/NPMRDSDataDAO');

jest.mock('../services/csvNPMRDSDataGenerator');
jest.mock('../services/dbNPMRDSDataGenerator');
jest.mock('../utils/csvStreamIterator');

describe('generateNPMRDSData tests', () => {
  test('from DB', async () => {
    const state = 'ny';
    const year = 2017;

    const params = {
      npmrdsDataSource: NPMRDS_DATA_SOURCES.DATABASE,
      state,
      year
    };

    const mockIterable = [1, 2, 3];
    const mockIterableClone = mockIterable.slice();

    dbNPMRDSDataGeneratorMock.generateData.mockImplementation(args => {
      expect(args.npmrdsDataSource).toEqual(NPMRDS_DATA_SOURCES.DATABASE);
      expect(args.state).toEqual(state);
      expect(args.year).toEqual(year);
      return mockIterable;
    });

    // Test that we are iterating over what the csvNPMRDSDataGeneratorMock gives us.
    for await (const d of generateNPMRDSData(params)) {
      expect(d).toBe(mockIterableClone.shift());
    }
  });

  test('from CSV file', async () => {
    const csvPath = join(
      __dirname,
      '../../tasks/hpmsPDF/albanyCountyNPMRDS.2017.csv.xz'
    );

    const params = {
      npmrdsDataSource: NPMRDS_DATA_SOURCES.FILE,
      csvPath
    };

    const mockIterable = [1, 2, 3];
    const mockIterableClone = mockIterable.slice();

    csvStreamIteratorMock.createCSVIterator.mockImplementation(args => {
      expect(args.csvPath).toEqual(csvPath);
      expect(args.stream).not.toBeDefined();
      return mockIterable;
    });

    csvNPMRDSDataGeneratorMock.generateData.mockImplementation(args => {
      expect(args.npmrdsDataSource).toEqual(NPMRDS_DATA_SOURCES.FILE);
      expect(args.csvPath).toEqual(csvPath);
      expect(args.csvIterator).toBe(mockIterable);
      return args.csvIterator;
    });

    // Test that we are iterating over what the csvNPMRDSDataGeneratorMock gives us.
    const generator = generateNPMRDSData(params);
    for await (const d of generator) {
      expect(d).toBe(mockIterableClone.shift());
    }
  });

  test('from CSV stream', async () => {
    const mockIterable = [1, 2, 3];
    const mockIterableClone = mockIterable.slice();

    const mockStream = eventStreamReadArray(mockIterable);
    const params = {
      npmrdsDataSource: NPMRDS_DATA_SOURCES.STREAM,
      stream: mockStream
    };

    csvStreamIteratorMock.createCSVIterator.mockImplementation(args => {
      expect(args.csvPath).not.toBeDefined();
      expect(args.stream).toBe(mockStream);
      return mockIterable;
    });

    csvNPMRDSDataGeneratorMock.generateData.mockImplementation(args => {
      expect(args.npmrdsDataSource).toEqual(NPMRDS_DATA_SOURCES.STREAM);
      expect(args.csvIterator).toBe(mockIterable);
      return args.csvIterator;
    });

    // Test that we are iterating over what the csvNPMRDSDataGeneratorMock gives us.
    const generator = generateNPMRDSData(params);
    for await (const d of generator) {
      expect(d).toBe(mockIterableClone.shift());
    }
  });
});
