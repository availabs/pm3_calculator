#!/usr/bin/env node

const { get, parse } = require('./DefaultGeoLevelPM3CalcFileName');

describe('DefaultGeoLevelPM3CalcFileName unit tests', () => {
  test('get', () => {
    const state = 'ny';
    const year = 2020;
    const tmcLevelPM3CalcVer = '11235';
    const geoLevelPM3CalcVer = '81321';

    const fname = get({
      state,
      year,
      tmcLevelPM3CalcVer,
      geoLevelPM3CalcVer
    });

    const expectedFname = `${state}.${year}.geo-level-pm3-calculations.tmcLevelVer-${tmcLevelPM3CalcVer}.v${geoLevelPM3CalcVer}.csv`;

    expect(fname).toEqual(expectedFname);
  });

  test('parse', () => {
    const state = 'ny';
    const year = 2020;
    const tmcLevelPM3CalcVer = '11235';
    const geoLevelPM3CalcVer = '81321';

    const fname = get({
      state,
      year,
      tmcLevelPM3CalcVer,
      geoLevelPM3CalcVer
    });

    const parsed = parse(fname);

    expect(parsed.state).toEqual(state);
    expect(parsed.year).toEqual(year);
    expect(parsed.tmcLevelPM3CalcVer).toEqual(tmcLevelPM3CalcVer);
    expect(parsed.geoLevelPM3CalcVer).toEqual(geoLevelPM3CalcVer);
  });
});
