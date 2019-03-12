/* eslint no-param-reassign: 0 */

const { runQuery } = require('../services/db_service');

const getTMCAttributes = async ({ state, tmcs, attributes , year}) => {
  const schema = state || 'public';

  let addedTMCCol = false;

  if (!attributes) {
    throw new Error('The attributes parameter is required.');
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

  const sql = `
    SELECT ${cols}
      FROM "${schema}".tmc_metadata_${year}
      ${tmcsList ? 'WHERE tmc = ANY($1)' : ''}
    ;
  `;

  const response = await runQuery(sql, tmcsList && [tmcsList]);

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
