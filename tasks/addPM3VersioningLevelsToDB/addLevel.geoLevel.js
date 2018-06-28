#!/usr/bin/env node

console.error('ERROR: This script is broken since change to getLeafTables');
process.exit(1);

const { runQuery, shutItDown } = require('../../src/services/db_service');

const geoLevelPM3CalcVer = '20180529';

const {
  get: getGeoLevelPM3TableName,
  parse: parseGeoLevelPM3TableName
} = require('../../src/utils/GeoLevelPM3TableName');

const { getLeafTables } = require('../../src/DAOs/PM3TableInfoDAO');

const noInheritYearTable = (stateTableName, yearTableName) => `
    ALTER TABLE ${yearTableName} NO INHERIT ${stateTableName};`;

const renameYearTableToVersionTableSQL = (yearTableName, versionTableName) => `
    ALTER TABLE ${yearTableName} RENAME TO ${versionTableName.replace(
  /^.*\./,
  ''
)};`;

const createNewYearTableSQL = (
  stateTableName,
  yearTableName,
  versionTableName
) => `
    CREATE TABLE ${yearTableName}
      (LIKE ${versionTableName} INCLUDING ALL)
      INHERITS(${stateTableName});`;

const inheritVersionTable = (yearTableName, versionTableName) => `
    ALTER TABLE ${versionTableName} INHERIT ${yearTableName};`;

const doIt = async () => {
  const yearTableNames = await getLeafTables('geolevel_pm3');

  for await (const yearTableName of yearTableNames) {
    const { state, year } = parseGeoLevelPM3TableName(yearTableName);
    const stateTableName = getGeoLevelPM3TableName({ state });
    const versionTableName = getGeoLevelPM3TableName({
      state,
      year,
      geoLevelPM3CalcVer
    });

    const addLayerSQL = `
      BEGIN;
      ${noInheritYearTable(stateTableName, yearTableName)}

      ${renameYearTableToVersionTableSQL(yearTableName, versionTableName)}

      ${createNewYearTableSQL(stateTableName, yearTableName, versionTableName)}

      ${inheritVersionTable(yearTableName, versionTableName)}

      COMMIT;
    `;

    await runQuery(addLayerSQL);
  }

  await shutItDown();
};

doIt();
