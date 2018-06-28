#!/usr/bin/env node

/* eslint no-console: 0 */
// https://www.developerfiles.com/adding-and-retrieving-comments-on-postgresql-tables/

const { execSync } = require('child_process');
const { join } = require('path');

const envFile = require('node-env-file');

envFile(join(__dirname, '../config/postgres.env'));

const {
  get: getGeoLevelPM3TableName
} = require('../src/utils/GeoLevelPM3TableName');

const {
  STATE,
  YEAR,
  NPMRDS_VER,
  GEO_LEVEL_PM3_CALCULATOR_GIT_HASH,
  GEO_LEVEL_PM3_CALC_VER,
  TMC_LEVEL_PM3_TABLE_METADATA
} = process.env;

if (!(GEO_LEVEL_PM3_CALC_VER && STATE && YEAR)) {
  console.log(GEO_LEVEL_PM3_CALC_VER, STATE, YEAR);
  console.error(
    'ERROR: GEO_LEVEL_PM3_CALC_VER, STATE, AND YEAR are required ENV variables.'
  );
  process.exit(1);
}

const buildTableComment = () =>
  JSON.stringify(
    {
      STATE,
      YEAR,
      NPMRDS_VER,
      GEO_LEVEL_PM3_CALCULATOR_GIT_HASH,
      GEO_LEVEL_PM3_CALC_VER,
      TMC_LEVEL_PM3_TABLE_METADATA: TMC_LEVEL_PM3_TABLE_METADATA
        ? JSON.parse(TMC_LEVEL_PM3_TABLE_METADATA)
        : null
    },
    null,
    4
  );

const loadTable = ({ tableName, tableComment }) => {
  const cmd = `
    read -r HEADER;
    psql \
      -c 'CREATE TABLE ${tableName} (LIKE "${STATE}".geolevel_pm3 INCLUDING ALL);' \
      -c "COPY ${tableName} ($HEADER) FROM STDIN CSV;" \
      -c 'COMMENT ON TABLE ${tableName} IS '\\''${tableComment}'\\'';'
    `;

  return execSync(cmd, { encoding: 'utf8', stdio: [process.stdin] });
};

const doIt = async () => {
  try {
    const tableName = getGeoLevelPM3TableName({
      state: STATE,
      year: YEAR,
      npmrdsVer: NPMRDS_VER,
      geoLevelPM3CalcVer: GEO_LEVEL_PM3_CALC_VER
    });
    const tableComment = buildTableComment();

    const output = loadTable({ tableName, tableComment });
    console.log(`${tableName}:`);
    console.log(output);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

doIt();
