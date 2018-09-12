#!/usr/bin/env node

const split = require('binary-split');
const { pipe, through } = require('mississippi');

const RURAL_AREA_CODE = 99999;
const SMALL_URBAN_AREA = 99998;

const NYS_UA_CODES_TBL = {
  albany: 970,
  binghamton: 7732,
  brigeport: 10162,
  buffalo: 11350,
  danbury: 22096,
  elmira: 27118,
  glensfalls: 33598,
  ithaca: 41914,
  kingston: 45262,
  middletown: 56899,
  nyc: 63217,
  poughkeepsie: 71803,
  rochester: 75664,
  saratoga: 79633,
  syracuse: 86302,
  utica: 89785,
  watertown: 92674
};

const DIRECTIONS = {
  N: 1,
  S: 2,
  E: 3,
  W: 4
};

const NYS_UA_CODES = new Set(Object.values(NYS_UA_CODES_TBL));

let sentHeader = false;

pipe(
  process.stdin,
  split(),
  through((line, enc, cb) => {
    if (!sentHeader) {
      cb(null, `${line}\n`);
      sentHeader = true;
      return;
    }

    const d = line.toString().split('|');
    let uaCode = +d[4];

    if (
      uaCode === NYS_UA_CODES_TBL.brigeport ||
      uaCode === NYS_UA_CODES_TBL.danbury
    ) {
      uaCode = NYS_UA_CODES_TBL.nyc;
    } else if (uaCode === NYS_UA_CODES_TBL.middletown) {
      uaCode = NYS_UA_CODES_TBL.poughkeepsie;
    } else if (uaCode !== RURAL_AREA_CODE && !NYS_UA_CODES.has(uaCode)) {
      uaCode = SMALL_URBAN_AREA;
    } else if (!uaCode) {
      uaCode = RURAL_AREA_CODE;
    }

    d[4] = uaCode;

    const dirChar = d[8];
    d[8] = DIRECTIONS[dirChar] || 5;

    cb(null, `${d.join('|')}\n`);
  }),
  process.stdout
);
