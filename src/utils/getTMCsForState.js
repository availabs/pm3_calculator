const { runQuery } = require('../services/db_service');

const getTMCsForState = async state => {
  const sql = `
    SELECT
        tmc
      FROM "${state}".tmc_attributes
    ;
  `;

  return (await runQuery(sql)).rows.map(({ tmc }) => tmc).sort();
};

module.exports = getTMCsForState;
