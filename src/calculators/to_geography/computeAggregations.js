/* eslint camelcase: 0 */
/* eslint no-param-reassign: 0 */

const assert = require('assert');
const lottrGeoLevelCols = require('./meta/lottrCols.geo-level.json');
const lottrBins = require('./meta/lottrBins.json');

const tttrGeoLevelCols = require('./meta/tttrCols.geo-level.json');
const tttrBins = require('./meta/tttrBins.json');

// Note: code below assumes index === month number.
const MONTHS = ['total', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const GEO_TYPES = ['county', 'mpo', 'ua'];

function computeAggregations(state, data) {
  const [{ state: state_code }] = data;

  const PERSON_DELAY_DATAHOLDER = MONTHS.reduce((out, d, i) => {
    out[`pd_${i}`] = 0;
    return out;
  }, {});

  const VEHICLE_DELAY_DATAHOLDER = MONTHS.reduce((out, d, i) => {
    out[`vd_${i}`] = 0;
    return out;
  }, {});

  const DELAY_DATAHOLDER = MONTHS.reduce((out, d, i) => {
    out[`d_${i}`] = 0;
    return out;
  }, {});

  const TOTAL_PERSON_DELAY_DATAHOLDER = MONTHS.reduce((out, d, i) => {
    out[`tpd_${i}`] = 0;
    return out;
  }, {});

  const TOTAL_VEHICLE_DELAY_DATAHOLDER = MONTHS.reduce((out, d, i) => {
    out[`tvd_${i}`] = 0;
    return out;
  }, {});

  const TOTAL_DELAY_DATAHOLDER = MONTHS.reduce((out, d, i) => {
    out[`td_${i}`] = 0;
    return out;
  }, {});

  const TTR_DATAHOLDER = Array.prototype
    .concat(lottrGeoLevelCols, tttrGeoLevelCols)
    .reduce((acc, col) => {
      acc[col] = 0;
      return acc;
    }, {});

  // console.log(fullData[10000])
  // make a list of geographies
  const geographies = data.reduce(
    (out, d) => {
      GEO_TYPES.forEach(geo => {
        if (!out[geo].includes(d[geo]) && d[geo] !== 'null') {
          out[geo].push(d[geo]);
        }
      });
      return out;
    },
    { county: [], mpo: [], ua: [], state: [state] }
  );

  // console.log('geographies', geographies)
  // geographies = {county: ['Albany']}
  const output = Object.keys(geographies).map(geo_type => {
    const final = {};

    final[geo_type] = geographies[geo_type].map(current_geo => {
      // console.log('current_geo', current_geo, geo_type)
      const seenTMCs = new Set();
      const seenYears = new Set();

      const lottrOperands = {};

      const current_geo_data = data
        .filter(d => geo_type === 'state' || d[geo_type] === current_geo)
        .reduce(
          (out, d) => {
            // Make sure each TMC is considered only once.
            assert(!seenTMCs.has(d.tmc));
            seenTMCs.add(d.tmc);

            seenYears.add(+d.year);
            assert(seenYears.size === 1);

            // console.log(d)
            if (+d.nhs === 1) {
              const avo = Number.isNaN(+d.avg_vehicle_occupancy)
                ? 1.5
                : +d.avg_vehicle_occupancy;

              const { aadt, faciltype } = d
              const dirFactor = Math.min(faciltype, 2);
              const dir_aadt = aadt / dirFactor;

              const lottrWeight = +d.length * +avo * +dir_aadt;

              MONTHS.forEach((month, i) => {
                // console.log(`vd_${month}`, +d[`vd_${month}`])
                out[`d_${i}`] += Number.isNaN(+d[`d_${month}`])
                  ? 0
                  : +d[`d_${month}`];
                out[`vd_${i}`] += Number.isNaN(+d[`vd_${month}`])
                  ? 0
                  : +d[`vd_${month}`];
                out[`pd_${i}`] += Number.isNaN(+d[`vd_${month}`])
                  ? 0
                  : +d[`vd_${month}`] * avo;

                out[`td_${i}`] += Number.isNaN(+d[`td_${month}`])
                  ? 0
                  : +d[`td_${month}`];
                out[`tvd_${i}`] += Number.isNaN(+d[`tvd_${month}`])
                  ? 0
                  : +d[`tvd_${month}`];
                out[`tpd_${i}`] += Number.isNaN(+d[`tvd_${month}`])
                  ? 0
                  : +d[`tvd_${month}`] * avo;
              });

              const road_type = d.is_interstate
                ? 'interstate'
                : 'noninterstate';

              MONTHS.forEach((m, i) => {
                // If yearly, no suffix. If monthly, suffix = _M
                const monthSuffix = i ? `_${i}` : '';

                const lottrCols = lottrBins.map(bin => `${bin}${monthSuffix}`);

                // Clean up the input data
                lottrCols.forEach(col => {
                  d[col] = Number.isNaN(+d[col]) ? 1 : +d[col];
                });

                const lottr = Math.max(...lottrCols.map(c => d[c]));

                if (lottr < 1.5) {
                  out[
                    `lottr_${road_type}_miles_passing${monthSuffix}`
                  ] += +d.length;
                }

                if (lottr < 1.5 && lottrWeight) {
                  const k = `lottr_${road_type}_weighted_passing${monthSuffix}`;
                  lottrOperands[k] = lottrOperands[k]
                    ? lottrOperands[k] + lottrWeight
                    : lottrWeight;
                }

                if (d.is_interstate && d.length && !Number.isNaN(+d.length)) {
                  const tttrCols = tttrBins.map(bin => `${bin}${monthSuffix}`);

                  tttrCols.forEach(col => {
                    d[col] = Number.isNaN(+d[col]) ? 1 : +d[col];
                    d[col] = d[col] === Infinity ? 3 : d[col];
                  });

                  let tttr = Math.max(...tttrCols.map(c => d[c]));

                  if (Number.isNaN(tttr) || tttr === Infinity) {
                    tttr = 1;
                  }

                  out[`tttr_interstate${monthSuffix}`] += +tttr * +d.length;
                }
              });

              out[`${road_type}_tmcs`] += 1;
              out[`${road_type}_mileage`] += +d.length;

              if (lottrWeight) {
                const k = `lottr_${road_type}_weighted_total`;
                lottrOperands[k] = lottrOperands[k]
                  ? lottrOperands[k] + +lottrWeight
                  : lottrWeight;
              }
            }
            return out;
          },
          {
            // default row
            geo: current_geo,
            type: geo_type,
            state,
            state_code,
            interstate_tmcs: 0,
            noninterstate_tmcs: 0,
            interstate_mileage: 0,
            noninterstate_mileage: 0,
            ...TTR_DATAHOLDER,
            ...PERSON_DELAY_DATAHOLDER,
            ...VEHICLE_DELAY_DATAHOLDER,
            ...DELAY_DATAHOLDER,
            ...TOTAL_PERSON_DELAY_DATAHOLDER,
            ...TOTAL_VEHICLE_DELAY_DATAHOLDER,
            ...TOTAL_DELAY_DATAHOLDER
          }
        );

      tttrGeoLevelCols.forEach(col => {
        if (col.match(/^lottr_/)) {
          const numerator = col.replace(/_ttr/, '_weighted_passing');
          const denominator = col.replace(/_ttr.*/, '_weighted_total');

          current_geo_data[col] = lottrOperands[denominator]
            ? lottrOperands[numerator] / lottrOperands[denominator]
            : null;
        }

        if (col.match(/^tttr_/)) {
          current_geo_data[col] = current_geo_data.interstate_mileage
            ? current_geo_data[col] / current_geo_data.interstate_mileage
            : 0;
        }
      });

      return current_geo_data;
    });
    return final;
  });

  let allGeo = [];

  Object.keys(geographies).forEach((geo, i) => {
    // console.log(output[i][geo])
    allGeo = allGeo.concat(output[i][geo]);
  });

  return allGeo;
}

module.exports = computeAggregations;
