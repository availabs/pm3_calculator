#!/usr/bin/env node

/* eslint no-console: 0 */

const { env } = process;
const { join } = require('path');
const { sync: mkdirpSync } = require('mkdirp');

const Promise = require('bluebird');
const minimist = require('minimist');

const toGeography = require('./src/calculators/to_geography');
const { DownloadTMCPM3 } = require('./utils/data_retrieval');

const argv = minimist(process.argv.slice(2));

const toNumerics = require('./src/utils/toNumerics');

const {
  NPMRDS_VER = 2,
  OUT_DIR = join(__dirname, '/data/states/')
} = toNumerics(Object.assign({}, env, argv));

mkdirpSync(OUT_DIR);

const states =
  NPMRDS_VER === 1
    ? require('./utils/states.npmrdsv1.json')
    : require('./utils/states.json');

Promise.map(
  states,
  state =>
    DownloadTMCPM3(state, NPMRDS_VER).then(
      data =>
        new Promise(resolve => {
          const years = data.rows.reduce((out, curr) => {
            if (!out.includes(curr.year)) {
              out.push(curr.year);
            }
            return out;
          }, []);

          const files = [];

          years.forEach(year => {
            const tmcYear = data.rows.filter(tmc => tmc.year === year);
            console.log(state, year, tmcYear.length);

            toGeography
              .processGeography(state, year, OUT_DIR, tmcYear, NPMRDS_VER)
              .then(filename => {
                files.push(filename);
              });
          });

          resolve(files);
        })
    ),
  { concurrency: 1 }
).then(outFiles => console.log(outFiles));
