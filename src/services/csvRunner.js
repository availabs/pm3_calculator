#!/usr/bin/env node
/* eslint no-restricted-syntax: 0 */

const TMCDataGenerator = require('./TMCDataGenerator.csv');

const doIt = async () => {
  const tmcDataGenerator = TMCDataGenerator(process.stdin);

  for await (const { data } of tmcDataGenerator) {
    console.log(JSON.stringify(data[0], null, 4));
  }
};

doIt();
