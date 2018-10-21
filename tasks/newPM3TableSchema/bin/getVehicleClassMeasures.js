#!/usr/bin/env node

const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const monthlyMeasuresFilePath = join(__dirname, '../meta/monthlyMeasures');
const vehicleClassMeasuresFilePath = join(__dirname, '../meta/vehicleClassMeasures');

const vehicleClassMeasuresSuffixRE = /_combi|_pass|_singl/;

const pm3Cols = readFileSync(monthlyMeasuresFilePath, {
  encoding: 'utf8'
}).split('\n');

const vehicleClassMeasures = pm3Cols
  .filter(c => c.match(vehicleClassMeasuresSuffixRE))
  .map(c => c.replace(vehicleClassMeasuresSuffixRE, '').trim())
  .sort()
  .reduce((acc, c) => {
    if (c === acc[acc.length - 1]) {
      return acc;
    }

    acc.push(c);
    return acc;
  }, []);

writeFileSync(vehicleClassMeasuresFilePath, `${vehicleClassMeasures.join('\n')}\n`);
