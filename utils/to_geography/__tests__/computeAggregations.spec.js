'use strict';

const { execSync } = require('child_process');
const { readFileSync } = require('fs');
const { join } = require('path');

const computeAggregations = require('../computeAggregations');

const tmcLevelPM3DataFilePath = join(__dirname, './tmcLevelPM3Data.json.xz');
const tmcLevelPM3Data = JSON.parse(
  execSync(`xzcat '${tmcLevelPM3DataFilePath}'`, { encoding: 'utf8' })
);

const goldenMasterFilePath = join(__dirname, './allGeo.json.xz');
const theGoldenMaster = JSON.parse(
  execSync(`xzcat '${goldenMasterFilePath}'`, { encoding: 'utf8' })
).sort();

const oldCols = Object.keys(theGoldenMaster[0]);

describe('computeAggregations Golden Master Tests', () => {
  test('ny 2017', done => {
    const newOutput = computeAggregations('ny', tmcLevelPM3Data).sort();

    const newOutputProjection = newOutput.map(row =>
      oldCols.reduce((acc, col) => {
        acc[col] = row[col];
        return acc;
      }, {})
    );

    expect(newOutputProjection).toEqual(theGoldenMaster);
    done();
  });
});
