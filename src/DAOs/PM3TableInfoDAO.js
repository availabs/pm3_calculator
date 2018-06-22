const { runQuery } = require('../services/db_service');

const pm3VersionTableExists = async tableName => {
  try {
    await runQuery('SELECT $1::regclass', [tableName]);
    return true;
  } catch (err) {
    return false;
  }
};

const getChildTables = async pm3TableName => {
  if (!pm3VersionTableExists(pm3TableName)) {
    throw new Error(`ERROR: ${pm3TableName} does not exist.`);
  }

  const tableNameDecomposed = pm3TableName.split('.');

  const parentSchema =
    tableNameDecomposed.length === 2
      ? tableNameDecomposed[0].toLowerCase().replace(/"/g, '')
      : 'public';

  const [parentTableName] = tableNameDecomposed.slice(-1);

  const sql = `
    SELECT
        cn.nspname AS schema_child,
        c.relname AS tablename_child
      FROM pg_inherits 
        JOIN pg_class AS c ON (inhrelid = c.oid)
        JOIN pg_class as p ON (inhparent = p.oid)
        JOIN pg_namespace pn ON pn.oid = p.relnamespace
        JOIN pg_namespace cn ON cn.oid = c.relnamespace
      WHERE pn.nspname = $1 AND p.relname = $2
    ;
  `;

  const { rows } = await runQuery(sql, [parentSchema, parentTableName]);

  if (rows.length === 0) {
    return null;
  }

  return rows.map(
    ({ schema_child, tablename_child }) =>
      `"${schema_child}".${tablename_child}`
  );
};

const getLeafTables = async (pm3TableName, tmcLevelPM3CalcVer) => {
  const childTables = await getChildTables(pm3TableName);

  // Base case
  if (!childTables) {
    if (tmcLevelPM3CalcVer) {
      return pm3TableName.includes(tmcLevelPM3CalcVer) ? [pm3TableName] : [];
    }
    return pm3TableName;
  }

  const descendents = await Promise.all(
    childTables.map(ct => getChildTables(ct, tmcLevelPM3CalcVer))
  );

  return Array.prototype.concat(...descendents);
};

const getMetadataFromTableComment = async pm3TableName => {
  const sql = 'select obj_description($1::regclass);';
  const { rows: [{ obj_description }] } = await runQuery(sql, [pm3TableName]);

  return obj_description ? JSON.parse(obj_description) : null;
};

module.exports = {
  pm3VersionTableExists,
  getChildTables,
  getLeafTables,
  getMetadataFromTableComment
};
