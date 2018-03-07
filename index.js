var Promise = require('bluebird');
var ProgressBar = require('progress');
var fs = require('fs');

var { QueryRunner, sendIt } = require("./utils/query_runner");
var db_service = require('./utils/db_service')
var traffic_distrubtions = require('./utils/traffic_distribution')
var CalculatePHED = require('./calculators/phed')


var bar = null;
const MeasureYear = 2017
const State = 'nj'

const DownloadTMCAtttributes = function DownloadTMCAtttributes (state) {
	return new Promise(function (resolve, reject) {
		const sql = `
			SELECT  tmc, faciltype, aadt, length, avg_speedlimit,
			congestion_level, directionality, avg_vehicle_occupancy,
			nhs, nhs_pct,is_interstate, is_controlled_access,
			mpo_code, ua_code, county
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

const CalculateMeasures = function CalculateMeasures (tmc, year) {
	var trafficDistribution = getTrafficDistribution(
		tmc.directionality,
		tmc.congestion_level,
		tmc.is_controlled_access,
		12
	)
	var dirFactor = +tmc.faciltype > 1 ? 2 : 1 
  	tmc.directional_aadt = tmc.aadt / dirFactor
	return DownloadTMCData(tmc.tmc, year, State)
		.then((tmcData) => {
			return new Promise(function (resolve, reject) {
				var phed = CalculatePHED(tmc, tmcData.rows, trafficDistribution)
				bar.tick()
				var row = tmc.tmc + ','
					+ tmc.length + ','
					+ tmc.avg_speedlimit + ','
					+ tmc.avg_vehicle_occupancy + ','
					+ tmc.nhs + ','
					+ tmc.nhs_pct + ','
					+ tmc.is_controlled_access + ','
					+ tmc.is_interstate + ','
					+ tmc.directionality + ','
					+ tmc.congestion_level + ','
					+ tmc.aadt + ','
					+ tmc.directional_aadt + ','
					+ tmc.county + ','
					+ tmc.mpo_code + ','
					+ tmc.ua_code + ','
					+ phed.hmean_vehicle_delay.join(',')
					+ phed.hmean_delay.join(',')				
				resolve(row)
			});
		})

	//return trafficDistribution
}



DownloadTMCAtttributes(State)
	.then(tmcs => {
		var testTmcs = tmcs.rows
			//.filter((d,i) => d.tmc === '120-05047')
			//.filter((d,i) => i < 100)
		TOTAL = testTmcs.length
		bar = new ProgressBar('[:bar] :current/:total = :percent  :elapsed/:eta', { total: TOTAL });
		return Promise.map(testTmcs, (tmc) => {
			return CalculateMeasures(tmc, MeasureYear)
		},{concurrency: 20})
		.then(measures => {
			//console.log('finished')
			var first_row = 'tmc,length,avg_speedlimit,avo,nhs,nhs_pct,is_controlled_access,is_interstate,directionality,congestion_level,aadt,directional_aadt,county,mpo,ua,region'
			first_row += 'vd_total,vd_jan,vd_feb,vd_mar,vd_apr,vd_may,vd_jun,vd_jul,vd_aug,vd_sep,vd_oct,vd_nov,vd_dec'
			first_row += 'd_total,d_jan,d_feb,d_mar,d_apr,d_may,d_jun,d_jul,d_aug,d_sep,d_oct,d_nov,d_dec'
			
			var output = first_row+'\n'+measures.join('\n')
			fs.writeFile(`data/${State}_${MeasureYear}_hmean_hour.csv`, output, function(err) {
			    if(err) {
			        return console.log(err);
			    }
			    console.log("The file was saved!");
			}); 			
			return
		})

	});