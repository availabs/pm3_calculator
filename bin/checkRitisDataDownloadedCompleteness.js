#!/usr/bin/env node

/* eslint no-console: 0 */

const { split, through } = require('event-stream');
const clone = require('clone');

const csvInputStream = require('../utils/csvInputStream');

const ALL = 'ALL';
const PASS = 'PASS';
const TRUCK = 'TRUCK';

const vehicleTypes = {
  'NPMRDS (Trucks and passenger vehicles)': ALL,
  'NPMRDS (Passenger vehicles)': PASS,
  'NPMRDS (Trucks)': TRUCK
};

function getCompletenessLedger(year, month) {
  const startDate = new Date(`${month}/01/${year}`);

  // '2019-01-01 00:00:00'

  const ledger = {};
  const currentDate = startDate;
  while (currentDate.getMonth() + 1 === month) {
    const mm = `0${currentDate.getMonth() + 1}`.slice(-2);
    const dd = `0${currentDate.getDate()}`.slice(-2);

    for (let h = 0; h < 24; h += 1) {
      const HH = `0${h}`.slice(-2);
      for (let m = 0; m < 60; m += 5) {
        const MM = `0${m}`.slice(-2);
        ledger[`${year}-${mm}-${dd} ${HH}:${MM}:00`] = {
          [ALL]: 0,
          [PASS]: 0,
          [TRUCK]: 0
        };
        // TODO: Handle daylight savings
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return ledger;
}

const getMissingDataLedger = ledger => {
  let missingData = null;
  const measurement_tstamps = Object.keys(ledger);

  for (let i = 0; i < measurement_tstamps.length; i += 1) {
    const ts = measurement_tstamps[i];
    if (!ledger[ts][ALL]) {
      missingData = missingData || {};
      missingData[ts] = missingData[ts] || [];
      missingData[ts].push('all');
    }
    if (!ledger[ts][PASS]) {
      missingData = missingData || {};
      missingData[ts] = missingData[ts] || [];
      missingData[ts].push('pass');
    }
    if (!ledger[ts][TRUCK]) {
      missingData = missingData || {};
      missingData[ts] = missingData[ts] || [];
      missingData[ts].push('truck');
    }
  }

  return missingData;
};

const verifyDataCompleteness = () => {
  let curTmc = null;

  let ledgerTemplate = null;
  let curLedger = null;

  let foundMissing = false;

  return through(
    data => {
      try {
        const { tmc_code, measurement_tstamp, datasource } = data;

        if (curTmc && curTmc !== tmc_code) {
          const missingData = getMissingDataLedger(curLedger);
          if (missingData) {
            foundMissing = true;
            console.log(JSON.stringify({ tmc_code, missingData }));
          }
          curTmc = null;
        }

        if (!curTmc) {
          curTmc = tmc_code;
          if (!ledgerTemplate) {
            const year = +measurement_tstamp.slice(0, 4);
            const month = +measurement_tstamp.slice(5, 7);
            ledgerTemplate = getCompletenessLedger(year, month);
          }
          curLedger = clone(ledgerTemplate);
        }

        const vehicleType = vehicleTypes[datasource];

        curLedger[measurement_tstamp][vehicleType] = 1;
      } catch (err) {
        console.error(JSON.stringify(data, null, 4));
        console.error(err);
        process.exit();
      }
    },

    function end() {
      this.emit('end');
      process.exit(foundMissing ? 1 : 0);
    }
  );
};

async function doIt() {
  process.stdin
    .pipe(split())
    .pipe(csvInputStream())
    .pipe(verifyDataCompleteness())
    .pipe(process.stdout);
}

doIt();

module.exports = verifyDataCompleteness;
