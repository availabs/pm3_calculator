/* eslint no-restricted-syntax: 0 */

const { runQuery } = require('../../utils/db_service');

const buildSQL = (tmc, year, state) => `
  SELECT
      npmrds_date("date") as npmrds_date, 
      epoch, 
      travel_time_all_vehicles,
      travel_time_passenger_vehicles,
      travel_time_freight_trucks
    FROM "${state}".npmrds 
    WHERE (
      (tmc = '${tmc}')
      AND 
      (date >= '${year}-01-01'::DATE AND date < '${year + 1}-01-01'::DATE)
    );
`;

async function* dbTMCDataGenerator({ state, year }) {
  const tmcsSQL = `
    SELECT
        tmc
      FROM "${state}".tmc_attributes
      ORDER BY tmc
    ;
  `;

  const tmcs = (await runQuery(tmcsSQL)).rows.map(({ tmc }) => tmc);

  for await (const tmc of tmcs) {
    const dSQL = buildSQL(tmc, year, state);

    const { rows: data } = await runQuery(dSQL);

    yield { data };
  }
}

module.exports = dbTMCDataGenerator;
