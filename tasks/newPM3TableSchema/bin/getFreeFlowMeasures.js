#!/usr/bin/env node

const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const monthlyMeasuresFilePath = join(__dirname, '../meta/monthlyMeasures');
const freeFlowMeasuresFilePath = join(__dirname, '../meta/freeFlowMeasures');

const freeFlowMeasuresSuffixRE = /_ff[a-zA-Z]*/;

const pm3Cols = readFileSync(monthlyMeasuresFilePath, {
  encoding: 'utf8'
}).split('\n');

const freeFlowMeasures = pm3Cols
  .filter(c => c.match(freeFlowMeasuresSuffixRE))
  .map(c => c.replace(freeFlowMeasuresSuffixRE, '').trim())
  .sort()
  .reduce((acc, c) => {
    if (c === acc[acc.length - 1]) {
      return acc;
    }

    acc.push(c);
    return acc;
  }, []);

writeFileSync(freeFlowMeasuresFilePath, `${freeFlowMeasures.join('\n')}\n`);
