const { runQuery } = require('../../services/db_service');

const geolevelPM3RequiredCols = require('./geolevelPM3RequiredCols');

// NOTE: Assumes that pm3TableName is a leaf table.
const getTMCLevelDataForGeoLevelAggregation = async pm3TableName => {
  const sql = `
      SELECT ${geolevelPM3RequiredCols}
        FROM ${pm3TableName}
      ;
   `;

  const { rows } = await runQuery(sql);

  return rows;
};

module.exports = { getTMCLevelDataForGeoLevelAggregation };
