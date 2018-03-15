#!/usr/bin/env node

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
  'travel_time_freight_trucks'
];

const dateEpochAggregator = () => {
  const curCSVRow = {};

  return through(
    function write(data) {
      try {
        const tmc = data.tmc_code;

        const date = +(
          data.measurement_tstamp.slice(0, 4) +
          data.measurement_tstamp.slice(5, 7) +
          data.measurement_tstamp.slice(8, 10)
        );

        const hh = +data.measurement_tstamp.slice(11, 13);
        const mm = +data.measurement_tstamp.slice(14, 16);
        const epoch = parseInt(hh * 12 + Math.floor(mm / 5));

        if (
          curCSVRow.tmc !== tmc ||
          curCSVRow.date !== date ||
          curCSVRow.epoch !== epoch
        ) {
          if (curCSVRow.tmc) {
            this.emit('data', curCSVRow);
          }
          for (let i = 0; i < outputCols.length; ++i) {
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
      } catch (err) {
        console.error(err);
      }
    },

    function end() {
      this.emit('data', curCSVRow);
      this.emit('end');
    }
  );
};

module.exports = dateEpochAggregator;
