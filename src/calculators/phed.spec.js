#!/usr/bin/env node

// https://facebook.github.io/jest/docs/en/mock-functions.html#mocking-modules

// https://github.com/facebook/jest/issues/2666
// https://babeljs.io/docs/plugins/transform-async-generator-functions/

/* eslint no-restricted-syntax: 0 */
/* eslint no-console: 0 */
/* eslint global-require: 0 */

const { execSync } = require('child_process');
const { join } = require('path');
const calculatePHED = require('./phed');

const goldenMasterInputArgsPath = join(
  __dirname,
  './__test_data__/calculatePHED.parameters.120P04340.json.xz'
);

// See the following email thread for source of cattlabMeasures values
//   From: Miller, Keith <KMiller@njtpa.org>
//   Date: Tue, Mar 6, 2018 at 2:49 PM
//   Subject: PHED for TMC 120P04340
//   To: Zhang, Yun Hai (DOT) <YunHai.Zhang@dot.ny.gov>, Eric Krans <ekrans@albany.edu>, Muro, Alexander Severino <amuro@albany.edu>
const cattlabMeasures = {
  ExcessDelay: 43.968,
  ExcessDelay_PK: 42.218,
  VehDelay_PK_hr: 28299.874
};

describe('PHED Golden Master tests', () => {
  test("Calculation close to CATTLab's", async () => {
    const params = JSON.parse(execSync(`xzcat ${goldenMasterInputArgsPath}`));
    const phed = calculatePHED(...params);
    const excessiveDelayDiffPct =
      Math.abs(phed.d_total - cattlabMeasures.ExcessDelay_PK) /
      cattlabMeasures.ExcessDelay_PK;
    const excessiveVehicleDelayDiffPct =
      Math.abs(phed.vd_total - cattlabMeasures.VehDelay_PK_hr) /
      cattlabMeasures.VehDelay_PK_hr;
    expect(excessiveDelayDiffPct).toBeLessThanOrEqual(0.05);
    expect(excessiveVehicleDelayDiffPct).toBeLessThanOrEqual(0.05);
  });
});
