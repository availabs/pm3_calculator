#!/usr/bin/env node

// https://facebook.github.io/jest/docs/en/mock-functions.html#mocking-modules

// https://github.com/facebook/jest/issues/2666
// https://babeljs.io/docs/plugins/transform-async-generator-functions/

/* eslint no-restricted-syntax: 0 */
/* eslint no-console: 0 */
/* eslint global-require: 0 */

const uuid = require('uuid/v1');

const { DATABASE } = require('../constants/NPMRDS_DATA_SOURCES');

const TMCAttributesDAOMock = require('./TMCAttributesDAO.js');
const NPMRDSDataDAOMock = require('./NPMRDSDataDAO');

const { shutItDown } = require('../services/db_service');

const { generateTMCData } = require('./TMCDataDAO');

const expectedAttrNames = require('./TMCDataDAO/attributes')
  .map(a => a.match(/(\w+)$/)[0])
  .sort();

jest.mock('./TMCAttributesDAO');
jest.mock('./NPMRDSDataDAO');

jest.setTimeout(1000000);

afterAll(async () => {
  await shutItDown();
});

describe('TMCDataDAO Integration tests', () => {
  test('DAO faithfully combines DB responses', async () => {
    const tmcs = Array(...Array(3)).map(() => uuid());

    const mockTMCAttrs = tmcs.reduce((acc, tmc) => {
      acc[tmc] = {
        tmc,
        uuid: uuid(),
        rand: Math.random()
      };
      return acc;
    }, {});

    // Each TMC gets 7 instances of mock NPMRDS data.
    const mockNPMRDSData = tmcs.reduce((acc, tmc) => {
      acc[tmc] = Array(...Array(7)).map(() => ({ tmc, tt: Math.random() }));
      return acc;
    }, {});

    TMCAttributesDAOMock.getTMCAttributes.mockImplementationOnce(
      () => mockTMCAttrs
    );
    NPMRDSDataDAOMock.generateNPMRDSData.mockImplementationOnce(() =>
      Object.values(mockNPMRDSData).map(data => ({ data }))
    );

    const params = { npmrdsDataSource: DATABASE };

    const tmcDataIterator = await generateTMCData(params);

    const tmcSet = new Set(tmcs);

    for await (const { tmcAttributes, data } of tmcDataIterator) {
      const { tmc } = tmcAttributes;
      expect(tmcAttributes).toEqual(mockTMCAttrs[tmc]);
      expect(data).toEqual(mockNPMRDSData[tmc]);
      tmcSet.delete(tmc);
    }

    expect(tmcSet.size).toEqual(0);
  });
});

describe('TMCDataDAO End-to-End tests', () => {
  test('DAO faithfully combines DB responses', async () => {
    const state = 'ny';
    const year = 2017;
    const tmcs = ['120N06542', '120+04895', '120-15831'];

    TMCAttributesDAOMock.getTMCAttributes.mockImplementationOnce(
      require.requireActual('../DAOs/TMCAttributesDAO').getTMCAttributes
    );

    NPMRDSDataDAOMock.generateNPMRDSData.mockImplementationOnce(
      require.requireActual('../DAOs/NPMRDSDataDAO').generateNPMRDSData
    );

    const params = { state, year, tmcs, npmrdsDataSource: DATABASE };

    const tmcDataIterator = await generateTMCData(params);

    const tmcSet = new Set(tmcs);
    console.log(tmcSet.size);

    for await (const { tmcAttributes, data } of tmcDataIterator) {
      console.log('data', data.length);
      const { tmc } = tmcAttributes;
      expect(Object.keys(tmcAttributes).sort()).toEqual(expectedAttrNames);
      expect(Array.isArray(data)).toBeTruthy();
      tmcSet.delete(tmc);
    }

    expect(tmcSet.size).toEqual(0);
  });
});
