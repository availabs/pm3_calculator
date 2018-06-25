#!/usr/bin/env node

console.error('ERROR: This script is broken since change to getLeafTables');
process.exit(1);

const { runQuery, shutItDown } = require('../../src/services/db_service');

const tmcLevelPM3CalcVer = '20180529';

const {
  get: getTMCLevelPM3TableName,
  parse: parseTMCLevelPM3TableName
} = require('../../src/utils/TMCLevelPM3TableName');

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
  const yearTableNames = await getLeafTables('pm3');

  for await (const yearTableName of yearTableNames) {
    const { state, year } = parseTMCLevelPM3TableName(yearTableName);
    const stateTableName = getTMCLevelPM3TableName({ state });
    const versionTableName = getTMCLevelPM3TableName({
      state,
      year,
      tmcLevelPM3CalcVer
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
