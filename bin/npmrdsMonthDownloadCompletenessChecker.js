#!/usr/bin/env node

/* eslint no-console: 0, camelcase: 0 */

const { split, through } = require('event-stream');
const deepEqual = require('deep-equal');
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
  const startDate = new Date(`${month}/01/${year} 12:00:00`);

  const ledger = {};

  const currentDate = startDate;

  const mm = `0${month}`.slice(-2);

  while (currentDate.getMonth() + 1 === month) {
    const d = +currentDate.getDate();
    const dd = `0${d}`.slice(-2);

    for (let h = 0; h < 24; h += 1) {
      const HH = `0${h}`.slice(-2);
      for (let m = 0; m < 60; m += 5) {
        const MM = `0${m}`.slice(-2);

        // Handles Daylight Savings Time
        //   Daylight Savings starts on the second Sunday in March.
        //   When daylight savings starts, we need to set the counter to 1
        //     because there will be no data for 2-3am.

        const ct =
          month === 3 && d > 7 && d < 15 && h === 2 && !currentDate.getDay()
            ? 1
            : 0;

        ledger[`${year}-${mm}-${dd} ${HH}:${MM}:00`] = {
          [ALL]: ct,
          [PASS]: ct,
          [TRUCK]: ct
        };
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return ledger;
}

const getDataGaps = ledger => {
  const measurement_tstamps = Object.keys(ledger);

  const data_gaps = [];

  let prevDatasourcesMissingData = [];
  let curDatasourcesMissingData = [];

  let curGap = [];

  for (let i = 0; i < measurement_tstamps.length; i += 1) {
    const ts = measurement_tstamps[i];

    curDatasourcesMissingData = [];
    if (!ledger[ts][ALL]) {
      curDatasourcesMissingData.push(ALL);
    }
    if (!ledger[ts][PASS]) {
      curDatasourcesMissingData.push(PASS);
    }
    if (!ledger[ts][TRUCK]) {
      curDatasourcesMissingData.push(TRUCK);
    }

    const prevGapBroken =
      prevDatasourcesMissingData.length &&
      !deepEqual(prevDatasourcesMissingData, curDatasourcesMissingData);

    const continuedGap =
      curDatasourcesMissingData.length &&
      deepEqual(prevDatasourcesMissingData, curDatasourcesMissingData);

    const newGapStarted =
      curDatasourcesMissingData.length &&
      !deepEqual(prevDatasourcesMissingData, curDatasourcesMissingData);

    // Previous datasources gap broken
    //   Record the gap
    if (prevGapBroken) {
      data_gaps.push({
        datasources: prevDatasourcesMissingData,
        start: curGap[0],
        end: curGap[1]
      });

      curGap = [];
    }

    // Gap continues for same datasources
    //   Update the gap end timestamp
    if (continuedGap) {
      curGap[1] = ts;
    }

    // New Gap
    //   set the gap start and end timestamps
    if (newGapStarted) {
      curGap = [ts, ts];
    }

    prevDatasourcesMissingData = curDatasourcesMissingData;
  }

  if (curGap.length) {
    data_gaps.push({
      datasources: prevDatasourcesMissingData,
      start: curGap[0],
      end: curGap[1]
    });
  }

  return data_gaps.length ? data_gaps : null;
};

const verifyDataCompleteness = () => {
  let curTmc = null;

  let dataYear = null;
  let dataMonth = null;

  let ledgerTemplate = null;
  let curLedger = null;

  let foundMissing = false;

  return through(
    data => {
      try {
        const { tmc_code, measurement_tstamp, datasource } = data;
        const year = +measurement_tstamp.slice(0, 4);
        const month = +measurement_tstamp.slice(5, 7);

        dataYear = dataYear || year;
        dataMonth = dataMonth || month;

        if (year !== dataYear || month !== dataMonth) {
          throw new Error('ERROR: Data should be for a single month.');
        }

        if (curTmc && curTmc !== tmc_code) {
          const data_gaps = getDataGaps(curLedger);
          if (data_gaps) {
            console.log(JSON.stringify({ tmc_code, data_gaps }));
            foundMissing = true;
            // throw new Error('ERROR: Missing data.');
          }
          curTmc = null;
        }

        if (!curTmc) {
          curTmc = tmc_code;
          if (!ledgerTemplate) {
            ledgerTemplate = getCompletenessLedger(year, month);
          }
          curLedger = clone(ledgerTemplate);
        }

        const vehicleType = vehicleTypes[datasource];

        curLedger[measurement_tstamp][vehicleType] = 1;
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    },

    function end() {
      this.emit('end');
      process.exit(foundMissing ? 1 : 0);
    }
  );
};

process.stdin
.pipe(split())
.pipe(csvInputStream())
.pipe(verifyDataCompleteness())
.pipe(process.stdout);
