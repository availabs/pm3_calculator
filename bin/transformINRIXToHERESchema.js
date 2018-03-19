#!/usr/bin/env node

const csvInputStream = require('../utils/csvInputStream');
const dateEpochAggregator = require('../utils/inrixCSVParserStream/dateEpochAggregator');
const csvOutputStream = require('../utils/csvOutputStream');

const outputCols = [
  'tmc',
  'date',
  'epoch',
  'travel_time_all_vehicles',
  'travel_time_passenger_vehicles',
  'travel_time_freight_trucks'
];

async function doIt() {
  process.stdin
    .pipe(csvInputStream())
    .pipe(dateEpochAggregator())
    .pipe(csvOutputStream(outputCols))
    .pipe(process.stdout);
}

doIt();