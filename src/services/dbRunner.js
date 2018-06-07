#!/usr/bin/env node
/* eslint no-restricted-syntax: 0 */

const TMCDataGenerator = require('./TMCDataGenerator.db');

const doIt = async () => {
  try {
    const tmcDataGenerator = TMCDataGenerator({ state: 'ny', year: 2017 });

    for await (const { data } of tmcDataGenerator) {
      console.log(JSON.stringify(data[0], null, 4));
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

doIt();
