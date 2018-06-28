/* eslint no-undef: 0 */

const { readFileSync } = require('fs');
const { join } = require('path');

const { connectionInfo, shutItDown } = require('../src/services/db_service');

afterAll(shutItDown);

const pgConfigPath = join(__dirname, '../config/postgres.env');
const pgConfig = readFileSync(pgConfigPath, { encoding: 'utf8' })
  .split('\n')
  .filter(line => line.trim().match(/^[^#]/) && line.match(/=/))
  .reduce((acc, line) => {
    [k, v] = line.split('=');
    acc[k.trim()] = v.trim();
    return acc;
  }, {});

describe('db_service uses the proper configuration file', () => {
  test('db_service is connected to the expected database', () => {
    expect(connectionInfo.PGDATABASE === pgConfig.PGDATABASE).toBeTruthy();
  });

  test('db_service is connected to the expected host', () => {
    expect(connectionInfo.PGHOST === pgConfig.PGHOST).toBeTruthy();
    expect(connectionInfo.PGHOSTADDR === pgConfig.PGHOSTADDR).toBeTruthy();
  });

  test('db_service is connected to the expected port', () => {
    expect(connectionInfo.PGPORT === pgConfig.PGPORT).toBeTruthy();
  });

  test('db_service is connected using the expected user', () => {
    expect(connectionInfo.PGUSER === pgConfig.PGUSER).toBeTruthy();
  });
});
