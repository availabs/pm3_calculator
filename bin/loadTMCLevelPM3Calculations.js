#!/usr/bin/env node

/* eslint no-console: 0 */

// https://www.developerfiles.com/adding-and-retrieving-comments-on-postgresql-tables/

const { execSync } = require('child_process');
const { join } = require('path');
const {
  get: getTMCLevelPM3TableName
} = require('../src/utils/TMCLevelPM3TableName');

const envFile = require('node-env-file');

envFile(join(__dirname, '../config/postgres.env'));

const {
  TMC_LEVEL_PM3_CALCULATOR_GIT_HASH,
  TMC_LEVEL_PM3_CALC_VER,
  CSV_PATH,
  HEAD,
  MEAN,
  NPMRDS_VER,
  NPMRDS_DATA_SOURCE,
  STATE,
  TIME,
  TMCS,
  YEAR
} = process.env;

if (!(TMC_LEVEL_PM3_CALC_VER && STATE && YEAR)) {
  console.error(
    'ERROR: TMC_LEVEL_PM3_CALC_VER, STATE, AND YEAR are required ENV variables.'
  );
  process.exit(1);
}

const buildTableComment = () =>
  JSON.stringify(
    {
      TMC_LEVEL_PM3_CALCULATOR_GIT_HASH,
      TMC_LEVEL_PM3_CALC_VER,
      CSV_PATH,
      HEAD,
      MEAN,
      NPMRDS_VER,
      NPMRDS_DATA_SOURCE,
      STATE,
      TIME,
      TMCS,
      YEAR
    },
    null,
    4
  );

const loadTable = ({ tableName, tableComment }) => {
  const bashCMD = `
    read -r HEADER;
    psql \
      -c 'CREATE TABLE ${tableName} (LIKE "${STATE}".pm3 INCLUDING ALL);' \
      -c "COPY ${tableName} ($HEADER) FROM STDIN CSV;" \
      -c 'COMMENT ON TABLE ${tableName} IS '\\''${tableComment}'\\'';'
    `;

  return execSync(bashCMD, { encoding: 'utf8', stdio: [process.stdin] });
};

const doIt = async () => {
  try {
    const tableName = getTMCLevelPM3TableName({
      state: STATE,
      year: YEAR,
      npmrdsVer: NPMRDS_VER,
      tmcLevelPM3CalcVer: TMC_LEVEL_PM3_CALC_VER
    });

    const tableComment = buildTableComment();

    const output = loadTable({ tableName, tableComment });
    console.log(output);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

doIt();
