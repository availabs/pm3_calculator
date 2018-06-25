#!/usr/bin/env node

/* eslint no-console: 0 */
/* eslint no-continue: 0 */
/* eslint no-await-in-loop: 0 */

const { env } = process;
const { writeFileSync, createReadStream } = require('fs');
const { join } = require('path');
const { execSync, spawn } = require('child_process');

const d3 = require('d3-dsv');
const minimist = require('minimist');

const { sync: mkdirpSync } = require('mkdirp');

const { computeAggregations } = require('../src/calculators/to_geography');

const {
  getTMCLevelDataForGeoLevelAggregation
} = require('../src/DAOs/PM3DataDAO');

const getDefaultCalcVersionName = require('../src/utils/getDefaultCalcVersionName');

const {
  get: getDefaultGeoLevelPM3CalcFileName
} = require('../src/utils/DefaultGeoLevelPM3CalcFileName');

const {
  parse: parsePM3TableName
} = require('../src/utils/TMCLevelPM3TableName');

const {
  getLeafTables,
  getMetadataFromTableComment
} = require('../src/DAOs/PM3TableInfoDAO');

const toNumerics = require('../src/utils/toNumerics');

const ver1States = require('../utils/states.npmrdsv1.json');
const ver2States = require('../utils/states.json');

const loaderPath = join(__dirname, './loadGeoLevelPM3Calculations.js');

const argv = minimist(process.argv.slice(2), {
  alias: {
    dir: ['DIR', 'outputDir', 'outputDirectory'],
    geoLevelPM3CalcVer: 'GEO_LEVEL_PM3_CALC_VER',
    npmrdsVer: 'NPMRDS_VER',
    state: 'STATE',
    tmcLevelPM3CalcVer: 'TMC_LEVEL_PM3_CALC_VER',
    uploadToDB: 'UPLOAD_TO_DB',
    year: 'YEAR'
  }
});

const {
  DIR,
  YEAR,
  NPMRDS_VER,
  STATE,
  TMC_LEVEL_PM3_CALC_VER,
  GEO_LEVEL_PM3_CALC_VER,
  UPLOAD_TO_DB
} = process.env;

const {
  dir = DIR || join(__dirname, '../data/geo-level-pm3/'),
  tmcLevelPM3CalcVer = TMC_LEVEL_PM3_CALC_VER,
  geoLevelPM3CalcVer = GEO_LEVEL_PM3_CALC_VER || getDefaultCalcVersionName(),
  npmrdsVer = NPMRDS_VER || 2,
  state = STATE || 'ny',
  uploadToDB = UPLOAD_TO_DB || true,
  year = YEAR
} = toNumerics(Object.assign({}, env, argv));

mkdirpSync(dir);

console.log(`Output directory: ${dir}`);

const doIt = async () => {
  let states = state && [state];
  states = states || (NPMRDS_VER === 1 ? ver1States : ver2States);

  for (let i = 0; i < states.length; i += 1) {
    const st = states[i];

    const leafTables = await getLeafTables({
      state: st,
      year,
      npmrdsVer,
      tmcLevelPM3CalcVer
    });

    if (!leafTables.length) {
      console.log(`No ${tmcLevelPM3CalcVer || ''} tables for ${st}.`);
      continue;
    }

    for (let j = 0; j < leafTables.length; j += 1) {
      const leafTable = leafTables[j];

      const data = await getTMCLevelDataForGeoLevelAggregation(leafTable);

      const yearsInData = new Set(data.map(({ year: yr }) => yr));

      if (yearsInData.size > 1) {
        console.error(
          `ERROR: Invariant broken. More than 1 years worth of data in ${
            leafTables[j]
          }.`
        );
      }

      const [yr] = yearsInData;

      const allGeo = computeAggregations(st, data);

      const fname = getDefaultGeoLevelPM3CalcFileName({
        state: st,
        year: yr,
        tmcLevelPM3CalcVer:
          tmcLevelPM3CalcVer || parsePM3TableName(leafTable).tmcLevelPM3CalcVer,
        geoLevelPM3CalcVer
      });

      const outf = join(dir, fname);

      const csv = d3.csvFormat(allGeo);
      writeFileSync(outf, csv);

      console.log(`wrote to ${fname}`);

      if (uploadToDB) {
        try {
          const leafTableMetadata = await getMetadataFromTableComment(
            leafTable
          );

          await new Promise((resolve, reject) => {
            const inFileStream = createReadStream(outf);
            const loader = spawn('bash', ['-c', `node ${loaderPath}`], {
              encoding: 'utf8',
              env: {
                STATE: st,
                YEAR: yr,
                NPMRDS_VER: npmrdsVer,
                GEO_LEVEL_PM3_CALCULATOR_GIT_HASH: execSync(
                  'git rev-parse HEAD',
                  { encoding: 'utf8' }
                ).trim(),
                GEO_LEVEL_PM3_CALC_VER: geoLevelPM3CalcVer,
                TMC_LEVEL_PM3_TABLE_METADATA: leafTableMetadata
              }
            });

            inFileStream.pipe(loader.stdin);

            loader.on('error', reject);
            loader.on('exit', resolve);

            loader.stdout.pipe(process.stdout);
            loader.stderr.pipe(process.stderr);
          });
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
};

doIt();
