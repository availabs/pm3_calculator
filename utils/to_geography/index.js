const { promisify } = require('util');
const { basename, join } = require('path');
const { readFile, writeFile } = require('fs');
const writeFileAsync = promisify(writeFile);

let d3 = require('d3-dsv');
let Promise = require('bluebird');

// var fileName = `${DIR}${STATE}_${YEAR}_${MEAN}_${TIME}.csv`
const computeAggregations = require('./computeAggregations');

function toGeography(DIR, fileName) {
  return new Promise(function(resolve, reject) {
    let STATE = fileName.split('_')[0];
    let YEAR = fileName.split('_')[1];
    console.log('read file', DIR + fileName);
    const inf = join(DIR, fileName);
    readFile(inf, 'utf8', function(err, data) {
      var fullData = d3.csvParse(data);
      processGeography(STATE, YEAR, DIR, fullData).then(output => {
        resolve(output);
      });
    }); //end readile
  }); //end promise
} // end func

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

module.exports = {
  toGeography,
  processGeography
};
