const readline = require('readline')
const { createReadStream } = require('fs')

let Promise = require('bluebird');
let db_service = require('./db_service')
let db_service_here = require('./db_service_here')

let traffic_distrubtions = require('./traffic_distribution')

const RITIS_DATASOURCES = require('./RITIS_DATASOURCES')

const DownloadTMCAtttributes = function DownloadTMCAtttributes (state) {
	return new Promise(function (resolve, reject) {
		const sql = `
			SELECT  tmc, faciltype, aadt, length, avg_speedlimit,
			congestion_level, directionality, avg_vehicle_occupancy,
			nhs, nhs_pct,is_interstate, is_controlled_access,
			mpo_code as mpo, ua_code as ua, county_code as county,
			state_code as state
	  		FROM public.tmc_attributes
	  		where state = '${state}'
    		and tmc in (select tmc from tmc_date_ranges where last_date >= '20170201');	
    `

	  	//console.log(sql);	
	  	db_service.runQuery(sql, [], (err,data) => {
	  		if (err) reject(err)
	  		resolve(data)
	  	})
	})
}

const DownloadHereToInrixMap = function DownloadHereToInrixMap () {
	return new Promise(function (resolve, reject) {
		const sql = `
			SELECT here, string_agg(inrix,',') as inrix_tmcs, length, avg_speedlimit, aadt
			FROM public.here_to_inrix as a	
			join public.attribute_data as b on here = tmc 
			group by here, length, avg_speedlimit, aadt

		`
		//and tmc in (select tmc from tmc_date_ranges where last_date >= '20170201');`
	  	db_service_here.runQuery(sql, [], (err,data) => {
	  		if (err) reject(err)
	  		resolve(data)
	  	})
	})
}

const DownloadTMCData = function DownloadTMCData (tmc, year, state) {
	return new Promise(function (resolve, reject) {
		const sql = `
			select 
				npmrds_date("date") as npmrds_date, 
				epoch, 
				travel_time_all_vehicles as "travelTime" 
			from "${state}".npmrds 
			where tmc = '${tmc}'
			and (date >= '${year}-01-01'::date AND date < '${year+1}-01-01'::date)
			`
		//console.log(sql);
		db_service.runQuery(sql, [], (err,data) => {
	  		if (err) reject(err)
	  		resolve(data)
	  	})
	})
}

const DownloadTMCDataHERE = function DownloadTMCData (tmc, year, state) {
	return new Promise(function (resolve, reject) {
		const sql = `
			select 
				npmrds_date("date") as npmrds_date, 
				epoch, 
				travel_time_all_vehicles as "travelTime" 
			from "${state}".npmrds 
			where tmc = '${tmc}'
			and (date >= '${year}-01-01'::date AND date < '${year+1}-01-01'::date)
			`
		// console.log(sql);
		db_service_here.runQuery(sql, [], (err,data) => {
	  		if (err) reject(err)
	  		resolve(data)
	  	})
	})
}

const inrixToAVAIL = (d) => {
	if (!d) {
		return d
	}

	const npmrds_date = parseInt(d.measurement_tstamp.replace(/ .*/, '').replace(/-/g, ''))

	const [hh, mm] = d.measurement_tstamp.replace(/^.* /, '').split(':').map(n => +n)
	const epoch = parseInt((hh * 12) + Math.floor(mm / 5))

	return {
		npmrds_date,
		epoch,
		travel_time_all_vehicles: d.travel_time_seconds
	}
}

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
            const curYear = parseInt(curTimestamp.replace(/-.*/, ''));

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



const getTrafficDistribution = function getTrafficDistribution(directionality, congestion_level, is_controlled_access, group=3) {
	//get the distro key for the distro
	let distroKey = 'WEEKDAY'
		+ '_' + (congestion_level ? congestion_level.replace(' ','_') : 'NO2LOW_CONGESTION')
		+ '_' + (directionality ? directionality.replace(' ','_') : 'EVEN_DIST')
		+ '_' + (is_controlled_access ? 'FREEWAY' : 'NONFREEWAY')

	//console.log('Traffic Distro', distroKey)
	//reduce from epoch level to disagg level 
	// 3 = 15 minutes (3 epochs)
	// 12 = 1 hour (12 epochs)
	return traffic_distrubtions[distroKey].reduce((output, current,current_index) => {
	    var reduceIndex =  Math.floor(current_index/group)
	    if (!output[reduceIndex]) { output[reduceIndex] = 0 }
	    output[reduceIndex] += current
	    return output
	}, [])

}

module.exports = {
	DownloadTMCData,
	DownloadTMCDataHERE,
	DownloadTMCAtttributes,
	ExtractTMCDataFromCSV,
	getTrafficDistribution,
	DownloadHereToInrixMap
}
