/* eslint camelcase: 0 */
/* eslint no-param-reassign: 0 */
const lottrGeoLevelCols = require('./meta/lottrCols.geo-level.json');
const lottrBins = require('./meta/lottrBins.json');

const tttrGeoLevelCols = require('./meta/tttrCols.geo-level.json');
const tttrBins = require('./meta/tttrBins.json');

// Note: code below assumes index === month number.
const MONTHS = ['total', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const GEO_TYPES = ['county', 'mpo', 'ua'];

function computeAggregations(STATE, data) {
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
    { county: [], mpo: [], ua: [], state: [STATE] }
  );

  // console.log('geographies', geographies)
  // geographies = {county: ['Albany']}
  const output = Object.keys(geographies).map(geo_type => {
    const final = {};
    final[geo_type] = geographies[geo_type].map(current_geo => {
      // console.log('current_geo', current_geo, geo_type)
      const current_geo_data = data
        .filter(d => geo_type === 'state' || d[geo_type] === current_geo)
        .reduce(
          (out, d) => {
            // console.log(d)
            if (+d.nhs === 1) {
              const avo = Number.isNaN(+d.avg_vehicle_occupancy)
                ? 1.5
                : +d.avg_vehicle_occupancy;

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
            }
            return out;
          },
          {
            // default row
            geo: current_geo,
            type: geo_type,
            state: STATE,
            state_code,
            interstate_tmcs: 0,
            noninterstate_tmcs: 0,
            interstate_mileage: 0,
            noninterstate_mileage: 0,
            ...TTR_DATAHOLDER,
            ...PERSON_DELAY_DATAHOLDER,
            ...VEHICLE_DELAY_DATAHOLDER,
            ...DELAY_DATAHOLDER
          }
        );

      tttrGeoLevelCols.forEach(col => {
        current_geo_data[col] = current_geo_data.interstate_mileage
          ? current_geo_data[col] / current_geo_data.interstate_mileage
          : 0;
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