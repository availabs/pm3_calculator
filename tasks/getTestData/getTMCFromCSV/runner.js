#!/usr/bin/env node

// This script will send the output of getTMCDataFromCSV to STDOUT.
// Used for debugging.

const { getTMCDataFromCSV } = require('./index.js');

const TMC = '110+04134';

async function doIt() {
  const d = await getTMCDataFromCSV('dc', 2017, TMC);
  console.log(JSON.stringify(d));
}

doIt();
