#!/usr/bin/env node

/* eslint no-console:0 */

const { through } = require('event-stream');

const vehicleTypes = {
  'NPMRDS (Trucks and passenger vehicles)': 'all_vehicles',
  'NPMRDS (Passenger vehicles)': 'passenger_vehicles',
  'NPMRDS (Trucks)': 'freight_trucks'
};

const outputCols = [
  'tmc',
  'date',
  'epoch',
  'travel_time_all_vehicles',
  'travel_time_passenger_vehicles',
  'travel_time_freight_trucks',
  'data_density_all_vehicles',
  'data_density_passenger_vehicles',
  'data_density_freight_trucks'
];

const dateEpochAggregator = () => {
  const curCSVRow = {};

  return through(
    function write(data) {
      try {
        if (data.travel_time_seconds === null) {
          return;
        }

        const tmc = data.tmc_code;

        const date = +(
          data.measurement_tstamp.slice(0, 4) +
          data.measurement_tstamp.slice(5, 7) +
          data.measurement_tstamp.slice(8, 10)
        );

        const hh = +data.measurement_tstamp.slice(11, 13);
        const mm = +data.measurement_tstamp.slice(14, 16);
        const epoch = parseInt(hh * 12 + Math.floor(mm / 5), 10);

        if (
          curCSVRow.tmc > tmc ||
          (curCSVRow.tmc === tmc &&
            (curCSVRow.date > date ||
              (curCSVRow.date === date && curCSVRow.epoch > epoch)))
        ) {
          console.error(
            'ERROR: Invariant broken. Input must be sorted by (TMC, date, epoch).'
          );
          console.error('\tTMC:', curCSVRow.tmc, tmc);
          console.error('\tdate:', curCSVRow.date, date);
          console.error('\tepoch:', curCSVRow.epoch, epoch);
          process.exit(1);
        }

        if (
          curCSVRow.tmc !== tmc ||
          curCSVRow.date !== date ||
          curCSVRow.epoch !== epoch
        ) {
          if (curCSVRow.tmc) {
            this.emit('data', curCSVRow);
          }
          for (let i = 0; i < outputCols.length; i += 1) {
            curCSVRow[outputCols[i]] = null;
          }
        }

        // ? Possible V8 optimization ?
        if (!curCSVRow.tmc) {
          curCSVRow.tmc = tmc;
          curCSVRow.date = date;
          curCSVRow.epoch = epoch;
        }

        const vehicleType = vehicleTypes[data.datasource];

        curCSVRow[`travel_time_${vehicleType}`] =
          +data.travel_time_seconds || null;

        curCSVRow[`data_density_${vehicleType}`] = data.data_density || null;
      } catch (err) {
        console.error(JSON.stringify(data, null, 4));
        console.error(err);
        process.exit();
      }
    },

    function end() {
      if (curCSVRow && curCSVRow.tmc) {
        this.emit('data', curCSVRow);
      } 
      this.emit('end');
    }
  );
};

module.exports = dateEpochAggregator;
