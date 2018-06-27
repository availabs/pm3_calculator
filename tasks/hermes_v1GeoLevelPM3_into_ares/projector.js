#!/usr/bin/env node

/* eslint no-await-in-loop: 0 */
/* eslint no-restricted-syntax: 0 */
/* eslint no-param-reassign: 0 */
/* eslint no-console: 0 */

const { join } = require('path');
const { writeFileSync } = require('fs');

const deepmerge = require('deepmerge');

const { csvFormat } = require('d3-dsv');

const { sync: mkdirpSync } = require('mkdirp');

const {
  runQuery: runQueryInrix,
  shutItDown: shutItDownInrix
} = require('../../src/services/db_service');
const {
  runQuery: runQueryHere,
  shutItDown: shutItDownHere
} = require('../../src/services/here_db_service');

const {
  get: getDefaultGeoLevelPM3CalcFileName
} = require('../../src/utils/DefaultGeoLevelPM3CalcFileName');

const states = ['ny'];

const years = [2014, 2015, 2016, 2017];

const npmrdsVer = 1;
const tmcLevelPM3CalcVer = 'hermes_NPMRDSv1';
const geoLevelPM3CalcVer = 'NYS_canonical';

const outputDir = join(__dirname, 'csv');
mkdirpSync(outputDir);

const precisionRound = (number, precision) => {
  if (!+number) {
    return number;
  }
  const factor = 10 ** precision;
  return Math.round(number * factor) / factor;
};

const getGeoIDMappings = async () => {
  const sql = `
    SELECT
        unnest(states) AS state,
        LOWER(geography_level::VARCHAR) AS type,
        geography_level_name AS name,
        geography_level_code AS code
      FROM geography_level_attributes_view
    ;
  `;

  const { rows } = await runQueryInrix(sql);

  const mappings = rows.reduce((acc, { state, type, name, code }) => {
    acc[state] = acc[state] || {};
    acc[state][type] = acc[state][type] || {};
    acc[state][type][name] = acc[state][type][name] || code;

    return acc;
  }, {});

  return mappings;
};

const getMeta = ({ state, year }, mappings) =>
  Object.keys(mappings[state]).reduce(
    (acc, type) => {
      acc[state][type] = {};
      Object.keys(mappings[state][type]).forEach(name => {
        const state_code = mappings[state].state[state];

        let geo =
          type === 'state'
            ? state
            : mappings[state] &&
              mappings[state][type] &&
              mappings[state][type][name];

        if (type === 'county') {
          geo = `${state_code}${geo}`;
        }

        acc[state][type][geo] = {
          state,
          geo,
          type,
          state_code,
          _state_: state,
          _year_: year
        };
      });

      return acc;
    },
    { [state]: {} }
  );

const lottrSQL = `
  SELECT
      LOWER(geography_level::VARCHAR) AS type,
      geography_name AS name,

      month,

      LOWER(functional_class::VARCHAR) AS functional_class,

      (included_mi) AS mileage,

      (passing_mi) AS miles_passing,
      (included_tmcs_ct + excluded_tmcs_ct) AS tmcs,

      ttr

    FROM top_level_travel_time_reliability
    WHERE (
      (state = $1)
      AND
      (year = $2)
      AND
      (geography_level <> 'CBSA')
    )
`;

const getLOTTRForStateYear = async ({ state, year }, mappings) => {
  const { rows } = await runQueryHere(lottrSQL, [state, year]);

  const joined = rows.reduce((acc, d) => {
    const {
      type,
      name,
      month,
      functional_class,
      mileage,
      miles_passing,
      tmcs,
      ttr
    } = d;

    let geo =
      type === 'state'
        ? state
        : mappings[state] &&
          mappings[state][type] &&
          mappings[state][type][name];

    if (type === 'county') {
      const state_code = mappings[state].state[state];
      geo = `${state_code}${geo}`;
    }

    acc[state] = acc[state] || {};
    acc[state][type] = acc[state][type] || {};

    const monthSuffix = month ? `_${month}` : '';

    acc[state][type][geo] = acc[state][type][geo] || {};
    Object.assign(acc[state][type][geo], {
      [`lottr_${functional_class}_ttr${monthSuffix}`]: precisionRound(ttr, 3),

      [`lottr_${functional_class}_miles_passing${monthSuffix}`]: miles_passing,

      [`${functional_class}_mileage`]: precisionRound(
        Math.max(
          acc[state][type][geo][`${functional_class}_mileage`] || 0,
          mileage
        ),
        3
      ),
      [`${functional_class}_tmcs`]: precisionRound(
        Math.max(acc[state][type][geo][`${functional_class}_tmcs`] || 0, tmcs),
        3
      )
    });

    return acc;
  }, {});

  return joined;
};

const tttrSQL = `
    SELECT
        LOWER(geography_level::VARCHAR) AS type,
        geography_name AS name,

        month,

        fr AS tttr_interstate

      FROM top_level_freight_reliability
      WHERE (
        (state = $1)
        AND
        (year = $2)
        AND
        (geography_level <> 'CBSA')
        AND
        (functional_class = 'INTERSTATE')
      )
  `;

const getTTTRForStateYear = async ({ state, year }, mappings) => {
  const { rows } = await runQueryHere(tttrSQL, [state, year]);

  const joined = rows.reduce((acc, d) => {
    const { type, name, month, tttr_interstate } = d;

    let geo =
      type === 'state'
        ? state
        : mappings[state] &&
          mappings[state][type] &&
          mappings[state][type][name];

    if (type === 'county') {
      const state_code = mappings[state].state[state];
      geo = `${state_code}${geo}`;
    }

    acc[state] = acc[state] || {};
    acc[state][type] = acc[state][type] || {};

    const monthSuffix = month ? `_${month}` : '';

    acc[state][type][geo] = Object.assign(acc[state][type][geo] || {}, {
      [`tttr_interstate${monthSuffix}`]: precisionRound(tttr_interstate, 3)
    });

    return acc;
  }, {});

  return joined;
};

const getPHEDForStateYear = async ({ state, year }) => {
  const sql = `
    SELECT
        geo,
        type,
        pd_0, pd_1, pd_2, pd_3, pd_4, pd_5, pd_6, pd_7, pd_8, pd_9, pd_10, pd_11, pd_12,
        vd_0, vd_1, vd_2, vd_3, vd_4, vd_5, vd_6, vd_7, vd_8, vd_9, vd_10, vd_11, vd_12,
        d_0, d_1, d_2, d_3, d_4, d_5, d_6, d_7, d_8, d_9, d_10, d_11, d_12
      FROM geolevel_pm3_npmrdsv1
      WHERE (
        (state = $1)
        AND
        (_year_ = $2)
AND (type = 'state')
      )
  `;

  const { rows } = await runQueryInrix(sql, [state, year]);
  // console.log(JSON.stringify(rows, null, 4).slice(0, 1000));

  const joined = rows.reduce((acc, d) => {
    const { geo, type } = d;

    acc[state] = acc[state] || {};
    acc[state][type] = acc[state][type] || {};

    acc[state][type][geo] = Object.keys(d)
      .filter(k => !k.match(/geo|type/))
      .reduce((acc2, k) => {
        acc2[k] = precisionRound(d[k], 3);
        return acc2;
      }, {});

    return acc;
  }, {});

  return joined;
};

const doIt = async () => {
  const mappings = await getGeoIDMappings();
  for await (const state of states) {
    for (let i = 0; i < years.length; i += 1) {
      const year = years[i];

      const meta = getMeta({ state, year }, mappings);
      const lottr = await getLOTTRForStateYear({ state, year }, mappings);
      const tttr = await getTTTRForStateYear({ state, year }, mappings);
      const phed = await getPHEDForStateYear({ state, year }, mappings);

      // console.log(JSON.stringify(phed, null, 4));

      const pm3 = deepmerge.all([meta, lottr, tttr, phed]);
      const rows = Object.keys(pm3[state])
        .reduce((acc, type) => {
          const geos = Object.keys(pm3[state][type]);
          return acc.concat(geos.map(geo => pm3[state][type][geo]));
        }, [])
        .filter(({ geo }) => geo);

      const csv = csvFormat(rows);
      const fileName = getDefaultGeoLevelPM3CalcFileName({
        state,
        year,
        npmrdsVer,
        tmcLevelPM3CalcVer,
        geoLevelPM3CalcVer
      });

      const outf = join(outputDir, fileName);
      writeFileSync(outf, csv);
      console.log(fileName);
    }
  }

  await shutItDownInrix();
  await shutItDownHere();
};

doIt();
