#!/usr/bin/env node

const { obj: pumpifyObj } = require('pumpify');

const csvInputStream = require('../csvInputStream');
const dateEpochAggregator = require('./dateEpochAggregator');
const tmcAggregator = require('./tmcAggregator');

const inrixParserStream = () =>
  pumpifyObj(csvInputStream(), dateEpochAggregator(), tmcAggregator());

module.exports = inrixParserStream;
