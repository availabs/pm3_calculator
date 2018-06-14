const { promisify } = require('util');
const { basename, join } = require('path');
const { readFile, writeFile } = require('fs');

const writeFileAsync = promisify(writeFile);

const d3 = require('d3-dsv');
const Promise = require('bluebird');

const log = require('../../utils/log');

// var fileName = `${DIR}${STATE}_${YEAR}_${MEAN}_${TIME}.csv`
const computeAggregations = require('./computeAggregations');

async function processGeography(STATE, YEAR, DIR, data, NPMRDS_VER = 2) {
  const allGeo = computeAggregations(STATE, data);
  const csv = d3.csvFormat(allGeo);

  const outf = join(
    DIR,
    `${STATE}_${YEAR}${NPMRDS_VER === 1 ? '.npmrdsv1' : ''}.csv`
  );

  await writeFileAsync(outf, csv);

  return basename(outf);
}

function toGeography(DIR, fileName) {
  return new Promise(resolve => {
    const [STATE, YEAR] = fileName.split('_');

    const inf = join(DIR, fileName);
    log.info(`read file ${inf}`);

    readFile(inf, 'utf8', (err, data) => {
      const fullData = d3.csvParse(data);
      processGeography(STATE, YEAR, DIR, fullData).then(resolve);
    }); // end readile
  }); // end promise
} // end func

module.exports = {
  toGeography,
  processGeography
};
