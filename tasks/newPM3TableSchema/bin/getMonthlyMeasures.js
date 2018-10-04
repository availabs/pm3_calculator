#!/usr/bin/env node

const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const pm3ColsFilePath = join(__dirname, '../meta/pm3Cols');
const monthlyMeasuresFilePath = join(__dirname, '../meta/monthlyMeasures');

const monthlyMeasuresSuffixRE = /_\d{1,2}$|_total$/;

const pm3Cols = readFileSync(pm3ColsFilePath, { encoding: 'utf8' }).split('\n');

const monthlyMeasures = pm3Cols
  .filter(c => c.match(monthlyMeasuresSuffixRE))
  .map(c => c.replace(monthlyMeasuresSuffixRE, '').trim())
  .sort()
  .reduce((acc, c) => {
    if (c === acc[acc.length - 1]) {
      return acc;
    }

    acc.push(c);
    return acc;
  }, []);

writeFileSync(monthlyMeasuresFilePath, monthlyMeasures.join('\n'));
