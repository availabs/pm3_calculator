let Promise = require('bluebird');
let db_service = require('./db_service')
let traffic_distrubtions = require('./traffic_distribution')


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
	  		and tmc in (select tmc from tmc_date_ranges where last_date >= '20170201');`
	  	//console.log(sql);	
	  	db_service.runQuery(sql, [], (err,data) => {
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
	DownloadTMCAtttributes,
	getTrafficDistribution
}