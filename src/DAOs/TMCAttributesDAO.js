/* eslint no-param-reassign: 0 */

const { runQuery } = require('../services/db_service');

const getTMCAttributes = async ({ state, tmcs, attributes, conflationYear }) => {
  const schema = state || 'public';

  let addedTMCCol = false;

  if (!attributes) {
    throw new Error('The attributes parameter is required.');
  }

  if (!conflationYear) {
    throw new Error('The conflationYear parameter is required.');
  }

  const cols = (Array.isArray(attributes) ? attributes : [attributes]).map(c =>
    c.toLowerCase()
  );

  // FIXME: This could break some edge cases.
  if (!cols.includes('tmc')) {
    addedTMCCol = true;
    cols.unshift('tmc');
  }

  const tmcsList = tmcs && (Array.isArray(tmcs) ? tmcs : [tmcs]);

  const queryParams = [conflationYear]
  const whereClauses = ['(conflation_year = $1)']

  if (tmcsList) {
    queryParams.push(tmcsList)
    whereClauses.push('(tmc = ANY($2))')
  }

  const sql = `
    SELECT ${cols.join()}
      FROM "${schema}".tmc_metadata
      WHERE (${whereClauses.join(' AND ')})
    ;
  `;

  const response = await runQuery(sql, queryParams);

  const tmcAttributes = response.rows.reduce((acc, attrs) => {
    const { tmc } = attrs;
    if (addedTMCCol) {
      delete attrs.tmc;
    }

    acc[tmc] = attrs;

    return acc;
  }, {});

  return tmcAttributes;
};

module.exports = { getTMCAttributes };
