/* eslint global-require: 0 */
/* eslint no-param-reassign: 0 */
/* eslint no-restricted-syntax: 0 */

const { DATABASE } = require('../../constants/NPMRDS_DATA_SOURCES');

const attributes = require('./attributes');
const { getTMCAttributes } = require('../TMCAttributesDAO.js');
const { generateNPMRDSData } = require('../NPMRDSDataDAO');

async function* generateTMCData(config) {
  if (!config) {
    throw new Error('No config passed to generateTMCData');
  }
  const tmcList =
    config.tmcs && (Array.isArray(config.tmcs) ? config.tmcs : [config.tmcs]);

  const tmcAttributes = await getTMCAttributes({
    state: config.state,
    attributes,
    tmcs: tmcList
  });

  const tmcSet = new Set(tmcList || Object.keys(tmcAttributes));

  const npmrdsDataIterator =
    config.npmrdsDataSource === DATABASE
      ? generateNPMRDSData(
          Object.assign({}, config, {
            tmcs: [...tmcSet]
          })
        )
      : generateNPMRDSData(config);

  for await (const { data } of npmrdsDataIterator) {
    if (data && data.length) {
      const [{ tmc }] = data;
      tmcSet.delete(tmc);
      yield {
        attrs: tmcAttributes[tmc] || {},
        data
      };
    }
  }

  if (config.head) {
    return
  }

  for (const tmc of tmcSet) {
    yield {
      tmcAttributes: tmcAttributes[tmc] || {},
      data: []
    };
  }
}

module.exports = { generateTMCData };
