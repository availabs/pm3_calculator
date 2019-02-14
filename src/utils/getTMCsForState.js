const { getTMCAttributes } = require('../DAOs/TMCAttributesDAO');

const getTMCsForState = async (state, conflationYear) =>
  (await getTMCAttributes({ state, attributes: 'tmc', conflationYear })).rows
    .map(({ tmc }) => tmc)
    .sort();

module.exports = getTMCsForState;
