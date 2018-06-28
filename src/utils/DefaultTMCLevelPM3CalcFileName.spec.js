#!/usr/bin/env node

const { get, parse } = require('./DefaultTMCLevelPM3CalcFileName');

describe('DefaultTMCLevelPM3CalcFileName unit tests', () => {
  test('get (no TMC qualifiers)', () => {
    const state = 'ny';
    const year = 2020;
    const mean = 'mean';
    const time = 12;
    const tmcLevelPM3CalcVer = '11235';

    const fname = get({
      state,
      year,
      mean,
      time,
      tmcLevelPM3CalcVer
    });
    const expectedFname = `${state}.${year}.tmc-level-pm3-calculations.${mean}_${time}.v${tmcLevelPM3CalcVer}.csv`;

    expect(fname).toEqual(expectedFname);
  });

  test('get (with TMC qualifiers)', () => {
    const state = 'ny';
    const year = 2020;
    const mean = 'mean';
    const time = 12;
    const tmcs = ['101-04098', '101+04098', '101-04099'];
    const head = 3;
    const tmcLevelPM3CalcVer = '11235';

    const fname = get({
      head,
      mean,
      state,
      time,
      tmcLevelPM3CalcVer,
      tmcs,
      year
    });
    const expectedFname = `${state}.${year}.tmc-level-pm3-calculations.${mean}_${time}.tmcs${tmcs.join(
      '_'
    )}.head${head}.v${tmcLevelPM3CalcVer}.csv`;

    expect(fname).toEqual(expectedFname);
  });

  test('parse', () => {
    const state = 'ny';
    const year = 2020;
    const mean = 'mean';
    const time = 12;
    const tmcs = ['101-04098', '101+04098', '101-04099'];
    const head = 3;
    const tmcLevelPM3CalcVer = '11235';

    const fname = get({
      head,
      mean,
      state,
      time,
      tmcLevelPM3CalcVer,
      tmcs,
      year
    });

    const parsed = parse(fname);

    expect(parsed.state).toEqual(state);
    expect(parsed.year).toEqual(year);
    expect(parsed.mean).toEqual(mean);
    expect(parsed.time).toEqual(time);
    expect(parsed.tmcs).toEqual(tmcs);
    expect(parsed.head).toEqual(head);
    expect(parsed.tmcLevelPM3CalcVer).toEqual(tmcLevelPM3CalcVer);
  });
});
