const { runQuery } = require('../services/db_service');

const pm3VersionTableExists = async tableName => {
  try {
    await runQuery('SELECT $1::regclass', [tableName]);
    return true;
  } catch (err) {
    return false;
  }
};

const getTmcLevelPM3AllTablesForVersion = async ({
  state = null,
  year = null,
  npmrdsVer = null,
  tmcLevelPM3CalcVer = null
}) => {
  const sql = `
    SELECT
      tmc_level_pm3_all_tables_for_version_fn($1, $2, $3, $4) AS table_name
    ;
  `;

  const { rows } = await runQuery(sql, [
    state,
    year,
    npmrdsVer,
    tmcLevelPM3CalcVer
  ]);

  return rows.map(({ table_name }) => table_name);
};

const getTmcLevelPM3AllActiveLeafTablesForVersion = async ({
  state = null,
  year = null,
  npmrdsVer = null,
  tmcLevelPM3CalcVer = null
}) => {
  const sql = `
    SELECT
      tmc_level_pm3_all_active_leaf_tables_for_version_fn($1, $2, $3, $4) AS table_name
    ;
  `;

  const { rows } = await runQuery(sql, [
    state,
    year,
    npmrdsVer,
    tmcLevelPM3CalcVer
  ]);

  return rows.map(({ table_name }) => table_name);
};

const getLeafTables = async ({
  state,
  year,
  npmrdsVer,
  tmcLevelPM3CalcVer
}) => {
  // If tmcLevelPM3CalcVer specified, get the tables for that version
  if (tmcLevelPM3CalcVer) {
    return getTmcLevelPM3AllTablesForVersion({
      state,
      year,
      npmrdsVer,
      tmcLevelPM3CalcVer
    });
  }

  // tmcLevelPM3CalcVer not specified, return the active default version tables.
  return getTmcLevelPM3AllActiveLeafTablesForVersion({
    state,
    year,
    npmrdsVer,
    tmcLevelPM3CalcVer
  });
};

const getMetadataFromTableComment = async pm3TableName => {
  const sql = 'select obj_description($1::regclass);';
  const { rows: [{ obj_description }] } = await runQuery(sql, [pm3TableName]);

  return obj_description ? JSON.parse(obj_description) : null;
};

module.exports = {
  pm3VersionTableExists,
  getLeafTables,
  getMetadataFromTableComment
};
