#!/usr/bin/env node

const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const pm3ColsFilePath = join(__dirname, '../meta/pm3Cols');
const nonMonthlyMeasuresFilePath = join(
  __dirname,
  '../meta/nonMonthlyMeasures'
);

const monthlyMeasuresSuffixRE = /_\d{1,2}$|_total$/;

const pm3Cols = readFileSync(pm3ColsFilePath, { encoding: 'utf8' }).split('\n');

const monthlyMeasures = new Set(
  pm3Cols
    .map(c => c.trim())
    .filter(c => c.match(monthlyMeasuresSuffixRE))
    .map(c => c.replace(monthlyMeasuresSuffixRE, ''))
    .sort()
    .reduce((acc, c) => {
      if (c === acc[acc.length - 1]) {
        return acc;
      }

      acc.push(c);
      return acc;
    }, [])
);

const nonMonthlyMeasures = new Set(
  pm3Cols
    .map(c => c.trim())
    .filter(c => !c.match(monthlyMeasuresSuffixRE))
    .filter(c => !monthlyMeasures.has(c))
);

writeFileSync(nonMonthlyMeasuresFilePath, [...nonMonthlyMeasures].join('\n'));
