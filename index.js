let Promise = require('bluebird');
let ProgressBar = require('progress');
let fs = require('fs');
let d3 = require('d3-dsv');

let { 
	DownloadTMCData, 
	DownloadTMCAtttributes,
	getTrafficDistribution
} = require('./utils/data_retrieval')
let CalculatePHED = require('./calculators/phed')
let CalculateTTR = require('./calculators/ttr')




let bar = null;
const MeasureYear = 2017
const State = 'ny'


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

				var tmcFiveteenMinIndex = tmcData.rows.reduce((output, current) => {
					var reduceIndex = current.npmrds_date + '_' + Math.floor(current.epoch/3)
					if (!output[reduceIndex]) { output[reduceIndex] = { speed:[], tt:[] } }
					output[reduceIndex].speed.push(+tmc.length / (current.travelTime / 3600))
					output[reduceIndex].tt.push(Math.round(current.travelTime)) 
					return output
				}, {})

				var phed = CalculatePHED(tmc, tmcFiveteenMinIndex, trafficDistribution)
				var ttr = CalculateTTR(tmc, tmcFiveteenMinIndex)
				bar.tick()
				resolve({
					...tmc,
					...ttr.lottr,
					...ttr.tttr,
					...phed.hmean_vehicle_delay,
					...phed.hmean_delay
				})		
			});
		})

	//return trafficDistribution
}



DownloadTMCAtttributes(State)
	.then(tmcs => {
		var testTmcs = tmcs.rows
			//.filter((d,i) => d.tmc === '120-05047')
			.filter((d,i) => i < 1000)
		TOTAL = testTmcs.length
		bar = new ProgressBar('[:bar] :current/:total = :percent  :elapsed/:eta', { total: TOTAL });
		return Promise.map(testTmcs, (tmc) => {
			return CalculateMeasures(tmc, MeasureYear)
		},{concurrency: 20})
		.then(measures => {
			//console.log('finished')
			
			var output = d3.csvFormat(measures)
			fs.writeFile(`data/${State}_${MeasureYear}_hmean_hour_test.csv`, output, function(err) {
			    if(err) { return console.log(err) }
			    console.log("The file was saved!")
			}); 			
			return
		})

	});