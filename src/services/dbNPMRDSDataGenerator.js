/* eslint no-restricted-syntax: 0 */
/* eslint no-param-reassign: 0 */

const { runQuery } = require('./db_service');
const getTMCsForState = require('../utils/getTMCsForState');

const buildSQL = state => `
  SELECT
      tmc,
      to_char(date, 'YYYYMMDD')::INT as date, 
      epoch, 
      travel_time_all_vehicles,
      travel_time_passenger_vehicles,
      travel_time_freight_trucks
    FROM "${state}".npmrds 
    WHERE (
      (tmc = $1)
      AND 
      (date >= $2::DATE AND date < $3::DATE)
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

  let tmcsList = tmcs && Array.isArray(tmcs) ? tmcs : [tmcs];

  // FIXME: Currently won't support years other than conflation years.
  tmcsList = tmcsList || (await getTMCsForState(state, year));

  for await (const tmc of tmcsList) {
    head -= 1;

    if (head < 0) {
      return;
    }
    const sql = buildSQL(state);
    const { rows: data } = await runQuery(sql, [
      tmc,
      `${year}-01-01`,
      `${year + 1}-01-01`
    ]);

    yield { data };
  }
}

module.exports = { generateData };
