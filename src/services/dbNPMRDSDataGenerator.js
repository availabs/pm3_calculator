/* eslint no-restricted-syntax: 0 */
/* eslint no-param-reassign: 0 */

const { runQuery } = require('./db_service');

const buildSQL = (tmc, year, state) => `
  SELECT
      tmc,
      to_char(date, 'YYYYMMDD')::INT as date, 
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

async function* generateData({
  state,
  year,
  tmcs,
  head = Number.POSITIVE_INFINITY
}) {
  if (!state) {
    throw new Error('state parameter is required.');
  } else if (!year) {
    throw new Error('year parameter is required.');
  }

  const tmcsSQL = `
    SELECT
        tmc
      FROM "${state}".tmc_attributes
      ORDER BY tmc
    ;
  `;

  const tmcsList = (
    (tmcs && Array.isArray(tmcs) ? tmcs : tmcs) ||
    (await runQuery(tmcsSQL)).rows.map(({ tmc }) => tmc)
  ).sort();

  for await (const tmc of tmcsList) {
    head -= 1;

    if (head < 0) {
      return;
    }
    const dSQL = buildSQL(tmc, year, state);

    const { rows: data } = await runQuery(dSQL);

    yield { data };
  }
}

module.exports = { generateData };
