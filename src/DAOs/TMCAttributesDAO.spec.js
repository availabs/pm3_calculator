#!/usr/bin/env node

// https://facebook.github.io/jest/docs/en/mock-functions.html#mocking-modules

// https://github.com/facebook/jest/issues/2666
// https://babeljs.io/docs/plugins/transform-async-generator-functions/

/* eslint no-restricted-syntax: 0 */
/* eslint no-console: 0 */
/* eslint global-require: 0 */

const db_serviceMock = require('../services/db_service');

const { getTMCAttributes } = require('./TMCAttributesDAO');

jest.mock('../services/db_service');

afterAll(async () => {
  db_serviceMock.shutItDown.mockImplementationOnce(
    require.requireActual('../services/db_service').shutItDown
  );

  await db_serviceMock.shutItDown();
});

describe('TMCAttributesDAO Integration tests', () => {
  test('DAO faithfully returns DB response', async () => {
    const mockTMCAttrs = {
      rows: [
        { tmc: 'foo', x: 1, y: 2, z: 3 },
        { tmc: 'bar', x: 1, y: 4, z: 9 },
        { tmc: 'baz', x: 1, y: 8, z: 27 }
      ]
    };

    const attributes = Object.keys(mockTMCAttrs.rows[0]);

    db_serviceMock.runQuery.mockImplementationOnce(() =>
      Promise.resolve(mockTMCAttrs)
    );

    const attrs = await getTMCAttributes({ attributes });
    expect(Object.keys(attrs)).toEqual(mockTMCAttrs.rows.map(({ tmc }) => tmc));
    expect(attrs.foo).toEqual(mockTMCAttrs.rows[0]);
    expect(attrs.bar).toEqual(mockTMCAttrs.rows[1]);
    expect(attrs.baz).toEqual(mockTMCAttrs.rows[2]);
  });
});

describe('TMCAttributesDAO End-to-End tests', () => {
  test('DAO requests, and gets, the specified columns from the database', async () => {
    // Here, we actually want to make the DB call.
    // See https://github.com/facebook/jest/issues/2649#issuecomment-360467278
    db_serviceMock.runQuery.mockImplementationOnce(
      require.requireActual('../services/db_service').runQuery
    );

    const state = 'ny';
    const tmcs = ['104-04098', '104+04098', '104-04099'];

    const attributes = [
      'tmclinear AS tmc_linear',
      'county',
      'length AS miles',
      'is_interstate'
    ];

    const expectedAttrNames = attributes.map(a => a.match(/(\w+)$/)[0]).sort();

    const params = { state, tmcs, attributes };
    const attrs = await getTMCAttributes(params);

    expect(Object.keys(attrs)).toEqual(tmcs);

    for (let i = 0; i < tmcs.length; i += 1) {
      const tmc = tmcs[i];
      expect(Object.keys(attrs[tmc]).sort()).toEqual(expectedAttrNames);
      expect(typeof attrs[tmc].tmc_linear).toEqual('string');
      expect(typeof attrs[tmc].miles).toEqual('number');
      expect(typeof attrs[tmc].is_interstate).toEqual('boolean');
    }
  });
});
