#!/usr/bin/env node

const { env } = process;
const { join } = require('path');

const Promise = require('bluebird');
const minimist = require('minimist');

const toGeography = require('./utils/to_geography');
const { DownloadTMCPM3 } = require('./utils/data_retrieval');

const argv = minimist(process.argv.slice(2));

const toNumerics = require('./src/utils/toNumerics');

const {
  NPMRDS_VER = 2,
  OUT_DIR = join(__dirname, '/data/states/')
} = toNumerics(Object.assign({}, env, argv));

const states =
  NPMRDS_VER === 1
    ? require('./utils/states.npmrdsv1.json')
    : require('./utils/states.json');

Promise.map(
  states,
  state => {
    return DownloadTMCPM3(state, NPMRDS_VER).then(data => {
      return new Promise((resolve, reject) => {
        const years = data.rows.reduce((out, curr) => {
          if (!out.includes(curr.year)) {
            out.push(curr.year);
          }
          return out;
        }, []);
        const files = [];
        years.forEach(year => {
          tmcYear = data.rows.filter(tmc => tmc.year === year);
          console.log(state, year, tmcYear.length);

          toGeography
            .processGeography(state, year, OUT_DIR, tmcYear, NPMRDS_VER)
            .then(filename => {
              console.log('filename', filename);
              files.push(filename);
            });
        });

        resolve(files);
      });
    });
  },
  { concurrency: 1 }
).then(outFiles => {
  return console.log(outFiles);
});
