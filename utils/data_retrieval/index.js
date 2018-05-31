/* eslint camelcase: 0 */

const readline = require('readline');
const { createReadStream } = require('fs');

const Promise = require('bluebird');
const db_service = require('../db_service');
const db_service_here = require('../db_service_here');

const traffic_distrubtions = require('../traffic_distribution');
const traffic_distrubtions_cattlab = require('../traffic_distribution_cattlab');

const geolevelPM3RequiredCols = require('./geolevelPM3RequiredCols');

const RITIS_DATASOURCES = require('../RITIS_DATASOURCES');

const DownloadTMCAtttributes = function DownloadTMCAtttributes(state) {
  return new Promise((resolve, reject) => {
    const sql = `
			SELECT  tmc, faciltype, aadt, aadt_singl, aadt_combi, length, direction,
      avg_speedlimit, congestion_level, directionality, avg_vehicle_occupancy,
			f_system, nhs, nhs_pct,is_interstate, is_controlled_access,
			mpo_code as mpo, ua_code, ua_code as ua, county_code as county,
			state_code, state_code as state, bounding_box
	  		FROM public.tmc_attributes
	  		where state = '${state}'
                        -- and tmc in (select tmc from tmc_date_ranges where last_date >= '20170201');
    `;
    // and tmc in (select tmc from tmc_date_ranges where last_date >= '20170201');`
    // console.log(sql);
    db_service.runQuery(sql, [], (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

const DownloadHereToInrixMap = function DownloadHereToInrixMap() {
  return new Promise((resolve, reject) => {
    const sql = `
			SELECT here, string_agg(inrix,',') as inrix_tmcs, length, avg_speedlimit, aadt, is_interstate
			FROM public.here_to_inrix as a	
			join public.attribute_data as b on here = tmc 
			group by here, length, avg_speedlimit, aadt, is_interstate

		`;
    // and tmc in (select tmc from tmc_date_ranges where last_date >= '20170201');`
    db_service_here.runQuery(sql, [], (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

const DownloadTMCData = function DownloadTMCData(tmc, year, state) {
  return new Promise((resolve, reject) => {
    const sql = `
			select
				npmrds_date("date") as npmrds_date, 
				epoch, 
				travel_time_all_vehicles as "travelTime" 
			from "${state}".npmrds 
			where tmc = '${tmc}'
			and (date >= '${year}-01-01'::date AND date < '${year + 1}-01-01'::date)
			`;
    // console.log(sql);
    db_service.runQuery(sql, [], (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

const DownloadTMCDataHERE = (tmc, year, state) =>
  new Promise((resolve, reject) => {
    const sql = `
			select
				npmrds_date("date") as npmrds_date, 
				epoch, 
				travel_time_all_vehicles as "travelTime" 
			from "${state}".npmrds 
			where tmc = '${tmc}'
			and (date >= '${year}-01-01'::date AND date < '${year + 1}-01-01'::date)
			`;
    // console.log(sql);
    db_service_here.runQuery(sql, [], (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });

const DownloadTMCPM3 = (state, NPMRDS_VER = 2) =>
  new Promise((resolve, reject) => {
    const sql = `
      SELECT ${geolevelPM3RequiredCols}
      FROM "${state}".pm3${+NPMRDS_VER === 1 ? '_npmrdsv1' : ''}
   ;
   `;

    db_service.runQuery(sql, [], (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });

const inrixToAVAIL = d => {
  if (!d) {
    return d;
  }

  const npmrds_date = parseInt(
    d.measurement_tstamp.replace(/ .*/, '').replace(/-/g, ''),
    10
  );

  const [hh, mm] = d.measurement_tstamp
    .replace(/^.* /, '')
    .split(':')
    .map(n => +n);
  const epoch = parseInt(hh * 12 + Math.floor(mm / 5), 10);

  return {
    npmrds_date,
    epoch,
    travel_time_all_vehicles: d.travel_time_seconds
  };
};

const ExtractTMCDataFromCSV = ({ tmc, csvPath, year }) => {
  let header;
  const rows = [];

  let tmcColIdx;
  let datasourceColIdx;
  let timestampColIdx;

  return new Promise((resolve, reject) => {
    try {
      const rl = readline.createInterface({
        input: createReadStream(csvPath)
      });

      rl.on('line', line => {
        const d = line.split(',').map(c => c.trim());

        const curTMC = d[tmcColIdx];
        const curDatasource = d[datasourceColIdx];
        const curTimestamp = d[timestampColIdx];

        if (!header) {
          header = d;
          tmcColIdx = header.indexOf('tmc_code');
          datasourceColIdx = header.indexOf('datasource');
          timestampColIdx = header.indexOf('measurement_tstamp');
        } else if (curTMC === tmc) {
          if (curDatasource !== RITIS_DATASOURCES.ALL_VEHICLES) {
            return;
          }

          if (year) {
            const curYear = parseInt(curTimestamp.replace(/-.*/, ''), 10);

            if (curYear < year) {
              return;
            }

            if (curYear > year) {
              return rl.close();
            }
          }

          rows.push(
            header.reduce(
              (acc, col, i) => Object.assign(acc, { [col]: d[i] }),
              {}
            )
          );
        } else if (rows.length) {
          rl.close();
        }
      });

      rl.on('close', () => resolve(rows.map(inrixToAVAIL)));
    } catch (e) {
      reject(e);
    }
  });
};

const getTrafficDistribution = function getTrafficDistribution(
  directionality,
  congestion_level,
  is_controlled_access,
  group = 3,
  type = 'avail'
) {
  // get the distro key for the distro
  const distroKey = `${'WEEKDAY' + '_'}${
    congestion_level ? congestion_level.replace(' ', '_') : 'NO2LOW_CONGESTION'
  }_${directionality ? directionality.replace(' ', '_') : 'EVEN_DIST'}_${
    is_controlled_access ? 'FREEWAY' : 'NONFREEWAY'
  }`;

  // console.log('Traffic Distro', distroKey)
  // reduce from epoch level to disagg level
  // 3 = 15 minutes (3 epochs)
  // 12 = 1 hour (12 epochs)

  if (type === 'cattlab') {
    return traffic_distrubtions_cattlab[distroKey].reduce(
      (output, current, current_index) => {
        if (!output[current_index]) {
          output[current_index] = 0;
        }

        output[current_index] += current;

        return output;
      },
      []
    );
  }

  return traffic_distrubtions[distroKey]
    .reduce((output, current, current_index) => {
      const reduceIndex = Math.floor(current_index / group);
      if (!output[reduceIndex]) {
        output[reduceIndex] = 0;
      }
      output[reduceIndex] += current;
      return output;
    }, [])
    .map(d => d / 100); // as percentage
};

module.exports = {
  DownloadTMCData,
  DownloadTMCDataHERE,
  DownloadTMCAtttributes,
  ExtractTMCDataFromCSV,
  getTrafficDistribution,
  DownloadHereToInrixMap,
  DownloadTMCPM3
};
